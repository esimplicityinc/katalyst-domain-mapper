#!/usr/bin/env python3
"""
Single-turn domain mapping with project context baked into the prompt.
Agent doesn't need to read files — just produce the mapping.
"""

import json, sys, time, threading, subprocess, http.client

BASE_HOST = "localhost:8090"
BASE_PATH = "/opencode"
SESSION_ID = None

assistant_msg_ids = set()
turn_complete = threading.Event()
question_events = []
stop_sse = threading.Event()
answer_count = 0
curl_proc = None
chars_streamed = 0


def post_json(path, body=None):
    conn = http.client.HTTPConnection(BASE_HOST, timeout=15)
    data = json.dumps(body).encode() if body else b""
    conn.request("POST", f"{BASE_PATH}{path}", data,
                 {"Content-Type": "application/json"})
    resp = conn.getresponse()
    raw = resp.read().decode()
    status = resp.status
    conn.close()
    return status, raw


def handle_event(data):
    global chars_streamed
    t = data.get("type", "")
    props = data.get("properties", {})

    if t == "message.updated":
        info = props.get("info", {})
        if info.get("role") == "assistant" and info.get("sessionID") == SESSION_ID:
            assistant_msg_ids.add(info["id"])

    elif t == "message.part.updated":
        part = props.get("part", {})
        delta = props.get("delta")
        if part.get("sessionID") != SESSION_ID or part.get("type") != "text":
            return
        if part.get("messageID", "") not in assistant_msg_ids:
            return
        if delta:
            chars_streamed += len(delta)
            sys.stdout.write(delta)
            sys.stdout.flush()

    elif t == "question.asked":
        if props.get("sessionID") == SESSION_ID:
            question_events.append(props)

    elif t == "session.idle":
        if props.get("sessionID") == SESSION_ID:
            turn_complete.set()

    elif t == "session.error":
        if props.get("sessionID") == SESSION_ID:
            print(f"\n[ERROR: {props.get('error','?')}]")
            turn_complete.set()


def start_sse():
    global curl_proc
    if curl_proc and curl_proc.poll() is None:
        curl_proc.kill()
    curl_proc = subprocess.Popen(
        ["curl", "-sN", f"http://{BASE_HOST}{BASE_PATH}/event"],
        stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, bufsize=0,
    )
    threading.Thread(target=_read_sse, daemon=True).start()
    time.sleep(0.5)


def _read_sse():
    buf = ""
    while curl_proc and curl_proc.poll() is None and not stop_sse.is_set():
        line = curl_proc.stdout.readline()
        if not line:
            break
        decoded = line.decode("utf-8", errors="replace").rstrip("\n")
        if decoded == "":
            if buf.strip():
                for bline in buf.split("\n"):
                    if bline.startswith("data:"):
                        try:
                            handle_event(json.loads(bline[5:].strip()))
                        except json.JSONDecodeError:
                            pass
            buf = ""
        else:
            buf += decoded + "\n"


def auto_answer():
    global answer_count
    while question_events:
        q = question_events.pop(0)
        req_id = q["id"]
        answers = []
        for qi in q.get("questions", []):
            opts = qi.get("options", [])
            pick = [opts[0]["label"]] if opts else ["Yes"]
            answers.append(pick)
            print(f"\n  >> Q: {qi.get('header','?')} — {qi.get('question','?')}")
            print(f"  >> A: {', '.join(pick)}")
            answer_count += 1
        s, _ = post_json(f"/question/{req_id}/reply", {"answers": answers})
        print(f"  >> [Replied {s}]\n")


def main():
    global SESSION_ID
    print("Creating session...")
    s, body = post_json("/session", {"title": "Domain Mapping: OPR"})
    SESSION_ID = json.loads(body)["id"]
    print(f"Session: {SESSION_ID}\n")

    start_sse()

    prompt = """[Context: Domain model "OPR" — Online Proposal Review / government passport application system.]

Here is the project structure for OPR (a Django/Python API + React client):

Top-level: api/, client/, config/, docs/, e2e/, infrastructure/, utils/, static/

Django apps (api/opr_api/):
- application/ — Core application processing
- application_session/ — User sessions for applications
- eligibility/ — Eligibility checking
- payment/ — Payment processing (PayGov integration)
- notification/ — Email/SMS notifications
- photo_analysis/ — Photo validation/analysis
- postal_address/ — Address validation
- feature_flags/ — Feature flag management
- cache/ — Caching layer
- tasks/ — Background/async tasks

Models (api/opr_api/models/):
- application_models.py — Core application entities
- notification_models.py — Notification templates and logs
- task_models.py — Background task tracking
- metrics_models.py — Usage metrics
- config_models.py — System configuration
- activity_api.py — Activity/audit logging

Controllers (api/opr_api/controllers/):
- application.py — CRUD for applications
- new_application.py — New application creation flow
- application_session.py — Session management
- notification.py — Notification sending
- pay_gov.py — PayGov payment integration
- pay_quote.py — Payment quotes
- postal_address.py — Address validation
- feature_flag.py — Feature flags
- app_value_config.py — App configuration
- health.py — Health checks

DO NOT use any tools to read files. Based ONLY on the structure above, produce a complete domain mapping:

1. **Bounded Contexts** (use the structured format from your instructions)
2. **Aggregates** per context (use structured format)
3. **Domain Events** (use structured format)
4. **Ubiquitous Language Glossary** (use structured format)

Use the question tool to ask me 1-2 clarifying questions about the business domain first, then produce the full mapping."""

    print("=" * 60)
    print("  DOMAIN MAPPING: OPR")
    print("=" * 60)
    print(f"\nSending prompt...\n")

    s, _ = post_json(
        f"/session/{SESSION_ID}/prompt_async",
        {"parts": [{"type": "text", "text": prompt}], "agent": "ddd-domain-mapper"},
    )
    print(f"[HTTP {s}]\n")

    deadline = time.time() + 300  # 5 min max
    while time.time() < deadline:
        if turn_complete.is_set():
            break
        if question_events:
            auto_answer()
        if curl_proc.poll() is not None:
            print("\n[SSE reconnecting...]")
            start_sse()
        time.sleep(0.3)

    if turn_complete.is_set():
        print(f"\n\n{'=' * 60}")
        print(f"  COMPLETE")
        print(f"  Characters streamed: {chars_streamed}")
        print(f"  Questions answered: {answer_count}")
        print(f"{'=' * 60}")
    else:
        print(f"\n[TIMEOUT — {chars_streamed} chars, {answer_count} Qs]")

    stop_sse.set()
    if curl_proc:
        curl_proc.kill()


if __name__ == "__main__":
    main()
