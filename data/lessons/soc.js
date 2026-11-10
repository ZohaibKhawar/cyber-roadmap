"use strict";

/* Step 7: Security operations (SOC). */
(() => {
const R = String.raw;

Object.assign(window.LESSONS, {
  "soc": [
    "A security operations centre (SOC) watches the organisation's logs and alerts around the clock, decides which ones are real and responds. It's where most people land their first security job, and almost everything earlier on this roadmap gets used here.",
    { fig: "soc-flow", cap: "How alerts move through a SOC. False alarms feed back into tuning; real incidents feed back into better detections." },
    { h: "Who does what" },
    { table: [
      ["Role", "Does"],
      ["Tier 1 analyst", "Works the alert queue: checks evidence, closes false positives, escalates real ones with notes"],
      ["Tier 2 analyst", "Investigates escalations in depth, scopes incidents, starts containment"],
      ["Tier 3 / threat hunter", "Looks for attacks no alert caught; handles the hardest cases"],
      ["Detection engineer", "Writes, tests and tunes the rules that create alerts"],
      ["Incident responder", "Leads the response to serious incidents, often across teams"],
      ["SOC manager", "Staffing, shifts, metrics, and reporting to leadership"],
    ], cap: "Smaller teams merge these roles; in managed security providers (MSSPs) one SOC serves many customers." },
    { h: "What a shift looks like" },
    { ul: [
      "Handover from the previous shift: open cases, anything odd.",
      "Work the queue: phishing reports, EDR alerts, suspicious sign-ins, firewall alerts.",
      "For each one: gather context, decide, document, close or escalate.",
      "Between alerts: tune a noisy rule, update a playbook, learn something.",
      "Hand over: what's still open and why.",
    ] },
    { h: "Numbers SOCs track" },
    { terms: [
      ["MTTD", "Mean time to detect: how long attackers are inside before someone notices."],
      ["MTTR", "Mean time to respond (or recover): how long from detection to contained."],
      ["False positive rate", "How many alerts turn out to be nothing. High rates burn analysts out."],
      ["Alerts per analyst per shift", "Workload, and a sign of whether tuning is needed."],
    ] },
    { h: "How to work through this step" },
    { ol: [
      "[[siem|SIEM and log searching]]: where you'll spend most of your day.",
      "[[triage|Alert triage and phishing analysis]]: the core tier 1 skill.",
      "[[edr|EDR and process trees]]: reading what happened on a machine.",
      "[[mitre|MITRE ATT&CK]] and [[detections|writing detections]]: the language and the craft.",
      "[[ir|The incident response process]]: what happens when it's real.",
    ] },
    { check: [
      ["What should a tier 1 analyst write when closing a false positive?", "Why it's a false positive, with the evidence checked, so the next analyst and the detection engineer can learn from it."],
      ["Why does a high false positive rate matter?", "Analysts start skimming or ignoring alerts, so real attacks get missed (alert fatigue)."],
    ] },
  ],

  "siem": [
    "A SIEM (security information and event management) collects logs from everywhere, makes them searchable in one place and runs rules that raise alerts. Splunk, Microsoft Sentinel, Elastic, Google SecOps and others all do the same job.",
    { h: "From raw log to alert" },
    { flow: ["Collect|agents, syslog, APIs", "Parse|split into fields", "Normalise|same field names everywhere", "Enrich|asset owner, geo-IP, threat intel", "Store|indexed, kept for months", "Detect and search|rules, dashboards, hunting"], cap: "What happens to every log line before an analyst sees it." },
    { h: "Which logs matter most" },
    { table: [
      ["Source", "Answers"],
      ["Identity (AD, Entra ID sign-ins)", "Who logged in, from where, with which MFA, and what failed"],
      ["Endpoint (EDR, Sysmon, Windows Security log)", "What ran on each machine and what it did"],
      ["DNS and proxy", "Which sites and domains each machine contacted"],
      ["Firewall and VPN", "What was allowed or blocked, and who connected remotely"],
      ["Email gateway", "Who received what, which attachments, what was blocked"],
      ["Cloud audit logs", "Who changed what in AWS, Azure or Microsoft 365"],
    ] },
    { tip: "Store and search in UTC. Mixing time zones across log sources is one of the easiest ways to build a wrong timeline." },
    { h: "Two query languages you'll meet" },
    { code: R`index=wineventlog EventCode=4625 earliest=-24h
| stats count by user, src
| sort -count
| head 10`, label: "Splunk SPL: top failed logons in the last day" },
    { code: R`SecurityEvent
| where TimeGenerated > ago(24h)
| where EventID == 4625
| summarize Failures = count() by TargetAccount, IpAddress
| top 10 by Failures`, label: "Microsoft Sentinel KQL: the same question" },
    "Both read the same way: start with a set of events, filter, group and count, sort. Field names depend on how each organisation brought its data in, so the first step in a new job is learning its field names.",
    { h: "Questions to practise" },
    { ul: [
      "Which accounts had more than 10 failed logons in an hour, followed by a success?",
      "Which machines looked up a domain that no other machine has ever looked up?",
      "Who signed in from two countries within an hour?",
      "Which hosts sent more than 1 GB out to a single external address today?",
    ] },
    { check: [
      ["Why normalise field names?", "So one search or rule works across many log sources: `user` means the same thing whether it came from Windows, a VPN or a cloud log."],
      ["What does `stats count by user, src` do in SPL?", "Groups events by user and source address and counts each combination."],
    ] },
  ],

  "detections": [
    { h: "The life of a detection" },
    { flow: ["Idea|threat intel, ATT&CK, an incident", "Research|what does it look like in logs?", "Write|the rule logic", "Test|catches the attack? quiet on normal data?", "Deploy", "Tune|cut false positives", "Review|still useful?"], loop: "repeat as attackers and systems change" },
    { h: "Four possible outcomes" },
    { fig: "confusion", cap: "Every rule trades missed attacks (false negatives) against noise (false positives). Good tuning cuts the noise without creating misses." },
    { h: "Sigma: one rule, many SIEMs" },
    "Sigma is an open format for writing detection rules once and converting them to Splunk, Sentinel, Elastic and others. Thousands of community rules are on GitHub to read and learn from.",
    { code: R`title: Office Application Starting a Command Shell
id: 6f1c2b7e-3a4d-4c8e-9b1a-2d5e7f8a9c01
status: experimental
description: Word, Excel or Outlook starting a shell, a common sign of a malicious document
logsource:
  product: windows
  category: process_creation
detection:
  selection:
    ParentImage|endswith:
      - '\WINWORD.EXE'
      - '\EXCEL.EXE'
      - '\OUTLOOK.EXE'
    Image|endswith:
      - '\cmd.exe'
      - '\powershell.exe'
      - '\wscript.exe'
      - '\mshta.exe'
  condition: selection
falsepositives:
  - Business add-ins that launch scripts; allow-list them by command line
level: high
tags:
  - attack.execution
  - attack.t1204.002`, label: "office_child_shell.yml" },
    { code: R`DeviceProcessEvents
| where InitiatingProcessFileName in~ ("winword.exe", "excel.exe", "outlook.exe")
| where FileName in~ ("cmd.exe", "powershell.exe", "wscript.exe", "mshta.exe")
| project Timestamp, DeviceName, AccountName, InitiatingProcessFileName, FileName, ProcessCommandLine`, label: "Roughly the same rule as a Microsoft Defender hunting query" },
    { h: "Tuning without going blind" },
    { table: [
      ["Approach", "Example", "Watch out"],
      ["Exclude a known-good case narrowly", "Allow one add-in by its exact path and signer", "Broad exclusions (a whole folder) hide attackers too"],
      ["Raise a threshold", "Alert on 20 failed logons, not 5", "Slow attacks slip under it"],
      ["Add context", "Only alert when the user isn't in IT", "Context data must stay accurate"],
      ["Lower the severity", "Send to a daily review instead of paging someone", "Make sure someone actually reviews it"],
    ] },
    { warn: "Never \"fix\" a noisy rule by switching it off without telling anyone. Record what was changed and why, and keep a test that proves the rule still catches the attack." },
    { check: [
      ["Which is more dangerous, a false positive or a false negative?", "A false negative: a real attack that raised no alert. False positives waste time; false negatives let attackers stay."],
      ["What's the benefit of writing rules in Sigma?", "One rule format that converts to many SIEMs, shared and reviewed by the community, and easy to keep in Git."],
    ] },
  ],

  "edr": [
    "Endpoint detection and response (EDR) tools such as Microsoft Defender for Endpoint, CrowdStrike Falcon and SentinelOne record what happens on each computer (processes, files, network connections, registry changes), raise alerts, and let you act on the machine remotely.",
    { h: "Reading a process tree" },
    "Every process has a parent. Most attacks show up as a parent and child that don't belong together.",
    { fig: "proctree", cap: "The same program (Word) in two trees. On the right, a macro in an emailed document starts a shell, then encoded PowerShell that calls out to the internet." },
    { h: "What normal looks like" },
    "A few Windows system processes have very predictable parents, paths and counts. Anything different is worth a look.",
    { table: [
      ["Process", "Normal parent", "Normal facts"],
      ["`services.exe`", "`wininit.exe`", "Exactly one, in System32"],
      ["`svchost.exe`", "`services.exe`", "Many copies, always in System32, always started by services.exe"],
      ["`lsass.exe`", "`wininit.exe`", "Exactly one; holds credentials, so anything reading its memory is suspicious"],
      ["`explorer.exe`", "`userinit.exe` (which exits, so often shown with no parent)", "One per logged-in user"],
      ["`winword.exe`, `excel.exe`", "`explorer.exe` or `outlook.exe`", "Shouldn't start shells or script hosts"],
    ], cap: "Based on the patterns in the SANS \"Hunt Evil\" poster." },
    { h: "What EDR lets you do" },
    { table: [
      ["Action", "When"],
      ["Isolate the machine", "It's probably compromised: cut it off from everything except the EDR console"],
      ["Kill a process, quarantine a file", "Stop one malicious thing quickly"],
      ["Collect an investigation package", "Grab logs, memory or artifacts before they change"],
      ["Live response", "Run commands on the machine remotely, carefully"],
      ["Search all machines", "Did any other computer see this file hash or connect to this domain?"],
    ] },
    { table: [
      ["", "Antivirus", "EDR", "XDR"],
      ["Looks at", "Files, against known signatures", "Behaviour on each endpoint", "Endpoints plus email, identity, cloud and network"],
      ["Strength", "Stops known malware", "Catches unknown attacks and shows the full story", "Connects one attack across many sources"],
    ] },
    { check: [
      ["`lsass.exe` is running from `C:\\Users\\Public\\`. Problem?", "Yes. The real lsass.exe only runs from System32 with wininit.exe as its parent. This is malware pretending to be it."],
      ["Why isolate a machine instead of turning it off?", "Isolation stops the attacker using it while keeping memory and running processes intact as evidence, and the EDR can still reach it."],
    ] },
  ],

  "ir": [
    { h: "The incident response lifecycle" },
    { fig: "ir-cycle", cap: "The classic four-phase cycle from NIST SP 800-61, still used in most playbooks and exams. Rev. 3 (2025) keeps the work and maps it onto CSF 2.0's functions." },
    { h: "Severity decides the response" },
    { table: [
      ["Level", "Example", "Response"],
      ["SEV 1, critical", "Ransomware spreading; customer data being stolen now", "All hands, leadership, legal; around the clock"],
      ["SEV 2, high", "One server compromised; an admin account taken over", "Incident team now; regular updates"],
      ["SEV 3, medium", "One laptop with malware, contained by EDR", "Normal working hours, tracked to closure"],
      ["SEV 4, low", "Phishing email reported, nobody clicked", "Handled by the SOC queue"],
    ], cap: "An example scale. Every organisation defines its own in its incident response plan." },
    { h: "Containment choices" },
    { table: [
      ["Action", "Stops", "Cost"],
      ["Isolate a host", "The attacker using that machine", "The user can't work"],
      ["Disable an account, revoke sessions", "Use of stolen credentials", "The person is locked out"],
      ["Reset passwords, rotate keys", "Reuse of stolen secrets", "Breaks anything using the old ones"],
      ["Block an IP, domain or file hash", "Contact with attacker infrastructure", "Attackers can switch infrastructure"],
      ["Take a system offline", "All further damage to it", "Downtime"],
    ] },
    { warn: "Don't tip off the attacker. If an email account is compromised, discuss the incident by phone or another channel. And don't wipe machines before evidence is collected." },
    { h: "Keep a timeline from the first minute" },
    { code: R`All times UTC
2026-11-10 13:02  User reports a suspicious invoice email; opened it at 12:41
2026-11-10 13:05  EDR shows WINWORD.EXE → powershell.exe on WS-0142 at 12:41
2026-11-10 13:09  WS-0142 isolated through EDR
2026-11-10 13:15  User's password reset, sessions revoked, MFA methods checked
2026-11-10 13:40  Same email found in 14 other mailboxes; removed; sender domain blocked
2026-11-10 14:30  Proxy logs: no other host contacted 203.0.113.50. Scope: one host`, label: "Incident timeline" },
    { h: "Who to tell" },
    "Big incidents are as much about people as technology. A typical plan names an incident commander and lists when to bring in IT, legal, privacy, communications, executives, the cyber insurer and sometimes law enforcement. Privacy laws may require reporting to regulators and affected people within strict deadlines (see [[law-ethics|law, privacy and ethics]]).",
    { h: "After it's over" },
    "A blameless post-incident review asks what happened, why it was possible, what went well, and what to change, then turns the answers into tracked actions: a new detection, a patched system, a faster playbook.",
    { check: [
      ["Name the four phases of the classic NIST incident response cycle.", "Preparation; detection and analysis; containment, eradication and recovery; post-incident activity."],
      ["Why keep the timeline in UTC?", "Logs come from systems in different time zones; one standard avoids mistakes in the order of events."],
      ["A compromised account's mailbox is used to discuss the incident. What's the risk?", "The attacker can read the response plans and adapt. Use a separate, trusted channel."],
    ] },
  ],

  "mitre": [
    "MITRE ATT&CK is a free catalogue of how real attackers behave, built from public reports. It gives everyone the same words: say \"T1566.001\" and any analyst knows you mean phishing with an attachment.",
    { fig: "attack-tactics", cap: "The 15 tactics of the Enterprise matrix, each with one example. Tactics are the attacker's goals; techniques are how they reach them." },
    { h: "The levels" },
    { table: [
      ["Level", "Answers", "Example"],
      ["Tactic", "Why: the attacker's goal", "TA0001 Initial Access"],
      ["Technique", "How, in general", "T1566 Phishing"],
      ["Sub-technique", "How, more precisely", "T1566.001 Spearphishing Attachment"],
      ["Procedure", "How one specific group did it", "\"Sent a macro-enabled invoice from a look-alike domain\""],
    ] },
    { h: "Mapping an incident" },
    { table: [
      ["What happened", "Tactic", "Technique"],
      ["Invoice email with a macro document", "Initial Access", "T1566.001 Spearphishing Attachment"],
      ["User opened it and enabled content", "Execution", "T1204.002 User Execution: Malicious File"],
      ["Macro ran encoded PowerShell", "Execution", "T1059.001 Command and Scripting Interpreter: PowerShell"],
      ["Created a task to run at every logon", "Persistence", "T1053.005 Scheduled Task/Job: Scheduled Task"],
      ["Read credentials from LSASS memory", "Credential Access", "T1003.001 OS Credential Dumping: LSASS Memory"],
    ] },
    { h: "What teams use it for" },
    { ul: [
      "**Coverage maps:** colour each technique by whether you have a detection for it (the ATT&CK Navigator does this), then fill the gaps that matter for your threats.",
      "**Shared language** in incident reports and threat intelligence.",
      "**Testing:** emulate a known group's techniques in a lab to check your detections fire.",
      "**Defences:** MITRE D3FEND maps defensive techniques that counter each one.",
    ] },
    { note: "ATT&CK changes twice a year. Version 19 (April 2026) split the old Defense Evasion tactic into Stealth and Defense Impairment, so older courses, rules and diagrams show 14 tactics. MITRE published a crosswalk for updating old mappings." },
    { check: [
      ["What's the difference between a tactic and a technique?", "A tactic is the goal (why); a technique is a way of achieving it (how)."],
      ["Which tactic covers stealing passwords from memory?", "Credential Access."],
      ["Why map detections to ATT&CK?", "To see which attacker behaviours you can and can't detect, and prioritise the gaps."],
    ] },
  ],

  "triage": [
    { h: "Triage in one picture" },
    { fig: "triage-flow", cap: "Every alert ends in one of three places. The note you write matters as much as the decision." },
    { h: "Context questions" },
    { ul: [
      "**Who:** is this user an admin, a new starter, someone on leave? Do they normally do this?",
      "**What host:** a server, a laptop, a domain controller? Who owns it?",
      "**When:** working hours, the middle of the night, just after a password change?",
      "**History:** has this alert fired for this user or host before, and what was the answer?",
      "**Around it:** what else happened on this host or account in the 30 minutes before and after?",
    ] },
    { h: "Reading email headers" },
    "Reported phishing is one of the biggest queues in most SOCs. Headers show where an email really came from. Read the Received lines from the bottom up: the lowest one is closest to the sender.",
    { code: R`Return-Path: <billing@invoices-example.net>
Received: from mail.invoices-example.net (mail.invoices-example.net [198.51.100.77])
        by mx.corp.example.com with ESMTPS id 4XyZ12
        for <alice@corp.example.com>; Tue, 10 Nov 2026 12:39:58 +0000
Authentication-Results: mx.corp.example.com;
       spf=pass smtp.mailfrom=invoices-example.net;
       dkim=pass header.d=invoices-example.net;
       dmarc=fail (p=none) header.from=example-supplier.com
From: "Example Supplier Accounts" <accounts@example-supplier.com>
Reply-To: <payments.update@freemail.example>
Subject: Overdue invoice 4471 - action required today`, label: "Headers of a reported email (trimmed)" },
    { table: [
      ["Clue", "What it tells you"],
      ["SPF and DKIM pass for `invoices-example.net`", "That domain really sent it, but it isn't the domain in From"],
      ["`dmarc=fail` for `example-supplier.com`", "The visible sender's domain didn't authorise this message"],
      ["`p=none`", "The real supplier's DMARC policy only monitors, so the email wasn't blocked"],
      ["Reply-To on a free mail service", "Replies go to the attacker, not the supplier"],
      ["Urgent subject about payment", "Classic business email compromise pressure"],
    ] },
    { table: [
      ["Check", "Proves"],
      ["SPF", "The sending server is allowed to send for the envelope sender's domain (a DNS TXT record lists them)"],
      ["DKIM", "The message was signed by a domain and not changed in transit"],
      ["DMARC", "SPF or DKIM passed for the same domain as the visible From address, and tells receivers what to do if not (none, quarantine or reject)"],
    ] },
    { h: "Handling links and attachments safely" },
    { ul: [
      "Never open them on your normal workstation. Use a sandbox, an isolated analysis VM or your email security tool's detonation feature.",
      "Defang indicators in notes and chat so nobody clicks them: `hxxps://invoices-example[.]net/pay`.",
      "Look up file hashes and URLs in your threat intel tools instead of uploading sensitive files to public sites.",
      "Search mail logs for the same sender, subject or link to find every recipient.",
    ] },
    { h: "Writing the escalation" },
    { code: R`Summary:   Phishing email with a malicious Word attachment opened on WS-0142 by alice.
Evidence:  EDR shows WINWORD.EXE → powershell.exe -enc at 12:41 UTC; connection to 203.0.113.50:443.
Scope:     14 other recipients; no other hosts contacted 203.0.113.50 (24 h of proxy logs).
Done:      Host isolated 13:09; password reset; email purged; sender domain blocked.
Need:      Tier 2 to review the decoded script and check alice's mailbox rules and sign-ins.`, label: "A good escalation note" },
    { try: [
      "Open any email in your own mailbox and view its original headers (\"Show original\" in Gmail, \"View message source\" in Outlook).",
      "Find the Authentication-Results line and read the SPF, DKIM and DMARC results.",
      "Do a free phishing investigation on a blue team platform such as LetsDefend and write the escalation note above for it.",
    ] },
    { check: [
      ["SPF and DKIM pass but DMARC fails. How?", "They passed for a different domain from the one in the visible From address, so they don't align with it."],
      ["Why defang URLs in tickets?", "So nobody clicks them by accident and chat or ticket tools don't fetch them automatically."],
      ["An alert fires because IT ran a vulnerability scan. What kind of outcome is it?", "A benign true positive: the rule worked, but the activity was expected. Close it with a note, and consider a narrow exclusion for the scanner."],
    ] },
  ],
});

Object.assign(window.FIGURES, {
  "soc-flow": (g) => {
    const sources = ["Endpoints (EDR)", "Identity sign-ins", "Firewall and DNS", "Cloud audit logs", "Email gateway"];
    const out = [];
    sources.forEach((s, i) => {
      const y = 34 + i * 40;
      out.push(g.box(10, y, 130, 32, `^${s}`, "m", 6), g.arrow(140, y + 16, 179, 130));
    });
    out.push(
      g.box(180, 90, 110, 80, ["!SIEM + EDR", "~collect,", "~correlate,", "~alert"], "d"),
      g.arrow(290, 130, 329, 130),
      g.box(330, 100, 120, 60, ["!Tier 1", "~triage the alert"], "a"),
      g.arrow(450, 118, 489, 72),
      g.box(490, 40, 180, 50, ["!False positive", "~close, note why, tune"], "m"),
      g.arrow(450, 140, 489, 145),
      g.box(490, 120, 180, 50, ["!Looks real: Tier 2", "~investigate and scope"], "y"),
      g.arrow(580, 170, 580, 199),
      g.box(490, 200, 180, 50, ["!Incident response", "~contain, remove, recover"], "a"),
      g.path("M580 40 C580 10 235 10 235 88", "ar da"), g.text(408, 14, "tune the rules", "c s mu"),
      g.path("M580 250 C580 280 235 280 235 172", "ar da"), g.text(408, 290, "lessons learned → new detections", "c s mu"),
    );
    return g.svg(680, 300, out);
  },

  "confusion": (g) => g.svg(680, 240, [
    g.text(300, 26, "Alert fired", "c b"), g.text(550, 26, "No alert", "c b"),
    g.text(170, 80, "An attack", "e b"), g.text(170, 96, "really happened", "e b"),
    g.text(170, 180, "Nothing bad", "e b"), g.text(170, 196, "happened", "e b"),
    g.box(180, 40, 240, 90, ["!True positive", "~caught it: this is the job"], "g"),
    g.box(430, 40, 240, 90, ["!False negative", "~missed it: the dangerous one", "~found later by hunting, or by luck"], "r"),
    g.box(180, 140, 240, 90, ["!False positive", "~noise that wastes analyst time;", "~too many cause alert fatigue"], "y"),
    g.box(430, 140, 240, 90, ["!True negative", "~quiet, and correctly so"], "m"),
  ]),

  "proctree": (g) => {
    const node = (x, y, w, label, cls = "") => g.box(x, y, w, 32, `\`${label}`, cls, 6);
    return g.svg(680, 310, [
      g.text(20, 24, "Normal", "b te"),
      node(20, 36, 170, "explorer.exe"),
      node(50, 82, 170, "chrome.exe"),
      node(50, 128, 240, "winword.exe report.docx"),
      g.path("M35 68 V144 H50"), g.line(35, 98, 50, 98),
      g.text(20, 196, "Explorer starts the apps a user opens.", "s mu"),
      g.text(20, 212, "Word opening a document is normal.", "s mu"),
      g.text(340, 24, "Suspicious", "b ac"),
      node(340, 36, 170, "outlook.exe"),
      node(370, 82, 250, "winword.exe invoice.docm", "y"),
      node(400, 128, 210, "cmd.exe /c powershell …", "a"),
      node(430, 174, 240, "powershell.exe -enc JAB…", "a"),
      g.box(460, 220, 210, 32, "^connects to 203.0.113.50:443", "r", 6),
      g.path("M355 68 V98 H370"), g.path("M385 114 V144 H400"), g.path("M415 160 V190 H430"), g.path("M445 206 V236 H460"),
      g.line(320, 14, 320, 260, "lf"),
      g.text(340, 284, "Word should never start a command shell, and encoded PowerShell calling out to the internet", "c s"),
      g.text(340, 300, "is a classic sign of a malicious document.", "c s"),
    ]);
  },

  "ir-cycle": (g) => g.svg(680, 245, [
    g.box(15, 20, 195, 60, ["!1  Preparation", "~plans, tools, training"], "m"),
    g.box(240, 20, 195, 60, ["!2  Detect and analyse", "~is it real? how big?"], "y"),
    g.box(240, 150, 195, 74, ["!3  Containment,", "!eradication, recovery", "~stop it, remove it, restore"], "a"),
    g.box(15, 150, 195, 74, ["!4  Post-incident", "~lessons learned", "~fix the gaps"], "t"),
    g.arrow(210, 50, 239, 50), g.arrow(337, 80, 337, 149, "bo"), g.arrow(240, 187, 211, 187), g.arrow(112, 150, 112, 81),
    g.text(347, 120, "back and forth", "s mu"),
    g.rect(455, 15, 215, 215, "m", 10),
    g.text(470, 40, "NIST SP 800-61 Rev. 3", "s b"),
    g.text(470, 57, "(2025) maps this onto CSF 2.0:", "s mu"),
    g.text(470, 86, "Govern, Identify, Protect", "s b"), g.text(470, 102, "= preparation", "s mu"),
    g.text(470, 128, "Detect", "s b"), g.text(470, 144, "= detection and analysis", "s mu"),
    g.text(470, 170, "Respond, Recover", "s b"), g.text(470, 186, "= containment to recovery", "s mu"),
    g.text(470, 214, "improvement runs through all", "s te"),
  ]),

  "attack-tactics": (g) => {
    const tactics = [
      [["Reconnaissance"], "research the target"],
      [["Resource", "Development"], "register domains"],
      [["Initial Access"], "phishing email"],
      [["Execution"], "run a script"],
      [["Persistence"], "scheduled task"],
      [["Privilege", "Escalation"], "exploit for admin"],
      [["Stealth"], "hide, blend in", "y"],
      [["Defense", "Impairment"], "turn off defences", "y"],
      [["Credential", "Access"], "steal passwords"],
      [["Discovery"], "map users, hosts"],
      [["Lateral", "Movement"], "log in elsewhere"],
      [["Collection"], "gather files"],
      [["Command and", "Control"], "call their server"],
      [["Exfiltration"], "copy data out"],
      [["Impact"], "encrypt, wipe", "r"],
    ];
    const out = [];
    tactics.forEach(([name, ex, cls = ""], i) => {
      const x = 9 + (i % 5) * 134;
      const y = 14 + Math.floor(i / 5) * 76;
      out.push(g.box(x, y, 126, 66, [...name.map((n) => `!${n}`), `~${ex}`], cls));
    });
    out.push(
      g.text(340, 256, "Read left to right, top to bottom: roughly the order of an attack.", "c s mu"),
      g.text(340, 272, "Since v19 (April 2026), Defense Evasion is split into Stealth and Defense Impairment.", "c s mu"),
    );
    return g.svg(680, 282, out);
  },

  "triage-flow": (g) => g.svg(680, 205, [
    g.box(20, 20, 150, 50, ["!Alert fires", "~or a user reports"], "m"),
    g.box(200, 20, 230, 50, ["!Gather context", "~who, which host, when, seen before?"]),
    g.box(460, 20, 200, 50, "!What is it?", "y"),
    g.arrow(170, 45, 199, 45), g.arrow(430, 45, 459, 45),
    g.path("M560 70 V95 H120 V119", "ar"), g.path("M340 95 V119", "ar"), g.path("M560 95 V119", "ar"),
    g.box(20, 120, 200, 70, ["!False positive", "~the rule misfired", "~close, note why, tune"], "m"),
    g.box(240, 120, 200, 70, ["!Benign but real", "~e.g. IT running a scan", "~close with a note"], "t"),
    g.box(460, 120, 200, 70, ["!Malicious or unsure", "~escalate with evidence", "~follow the playbook"], "a"),
  ]),
});
})();
