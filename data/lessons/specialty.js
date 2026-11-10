"use strict";

/* Step 8: Pick a specialty. */
(() => {
const R = String.raw;

Object.assign(window.LESSONS, {
  "specialty": [
    "After a year or two in general security work, most people go deep in one area. You don't need to choose before your first job, but it helps to know what each path is actually like day to day.",
    { fig: "specialty-map", cap: "A rough map of the main paths. Most people start in the SOC (or IT) and move in whichever direction they enjoy most." },
    { h: "The paths side by side" },
    { table: [
      ["Path", "A typical day", "Background that helps", "Common way in"],
      ["[[dfir|Incident response and forensics]]", "Rebuilding what happened from disks, memory and logs; writing reports", "SOC work, Windows internals", "SOC tier 2, then an IR team or consultancy"],
      ["[[threat-intel|Threat intelligence]]", "Reading reports, tracking groups, writing briefs for decision-makers", "Writing, research, sometimes languages or politics", "SOC, journalism, military or government intelligence"],
      ["[[detection-eng|Detection engineering]]", "Writing and testing rules, hunting through data", "SOC work plus scripting", "Senior SOC analyst"],
      ["[[penetration-testing.html|Penetration testing]]", "Testing systems with permission and writing up the findings", "Networking, Linux, web, Active Directory", "IT or SOC, then a junior tester role"],
      ["[[appsec-path|Application security]]", "Reviewing code and designs, helping developers fix flaws", "Software development", "Developer who moves into security"],
      ["[[cloudsec-path|Cloud security]]", "Designing guardrails, reviewing cloud setups, automating checks", "Cloud and infrastructure as code", "Cloud engineer or sysadmin"],
      ["[[grc-path|GRC]]", "Risk assessments, policies, audits, vendor reviews", "Organisation, writing, business sense", "IT audit, compliance, or straight from school"],
    ] },
    { h: "How to choose" },
    { ul: [
      "Notice which tickets you volunteer for. That's usually the answer.",
      "Ask people in each role what they did last Tuesday. Job titles hide very different days.",
      "Read ten real job ads for each path in your city: the tools, certs and experience asked for.",
      "Try a weekend project in two paths: a forensics challenge and a small cloud lab, for example.",
    ] },
    { check: [
      ["Which path suits someone who loves writing and research more than hands-on keyboards?", "Threat intelligence or GRC."],
      ["Which background makes application security much easier?", "Software development, because you're reviewing code and talking to developers all day."],
    ] },
  ],

  "dfir": [
    "Digital forensics and incident response (DFIR) answers the questions after a breach: how did they get in, what did they touch, what did they take, and are they still here? Work has to be careful enough to stand up in court or with a regulator.",
    { h: "Collect the most fragile evidence first" },
    { fig: "volatility", cap: "The order of volatility (RFC 3227). Memory disappears when a machine is switched off, which is why responders isolate machines rather than unplugging them." },
    { h: "Chain of custody" },
    "Every piece of evidence needs a record: who collected it, when, how, where it has been stored and who has handled it since. Responders hash each image (SHA-256) when it's taken so they can prove later that it hasn't changed, and they work on copies, never the original.",
    { h: "Windows artifacts" },
    { table: [
      ["Artifact", "Can show"],
      ["Prefetch (`C:\\Windows\\Prefetch`)", "Which programs ran, how often and when last (on workstations)"],
      ["Amcache", "Programs present or run, with file hashes"],
      ["Shimcache (AppCompatCache)", "Programs the system noticed; not proof they ran on modern Windows"],
      ["Event logs", "Logons, services, tasks, PowerShell, cleared logs"],
      ["Registry: UserAssist, Run keys, ShellBags, USBSTOR", "Programs a user opened, startup items, folders browsed, USB devices"],
      ["$MFT", "Every file's timestamps, including deleted ones not yet overwritten"],
      ["LNK files and Jump Lists", "Files and folders a user opened"],
      ["SRUM", "Which apps used the network, and how much, hour by hour"],
      ["Browser history", "Downloads and sites visited"],
    ] },
    { h: "Tools" },
    { table: [
      ["Tool", "For"],
      ["KAPE, Velociraptor", "Collecting artifacts quickly, from one machine or thousands"],
      ["FTK Imager", "Imaging disks and memory"],
      ["Volatility 3", "Analysing memory images: processes, network connections, injected code"],
      ["Autopsy / The Sleuth Kit", "Exploring disk images"],
      ["Eric Zimmerman's tools", "Parsing Windows artifacts into readable tables"],
      ["Plaso (log2timeline)", "Building a super timeline from many sources"],
    ] },
    { h: "The output is a story" },
    "Everything ends in a timeline and a report: initial access, what the attacker did hour by hour, what data was affected, and what to fix. Clear writing matters as much as technical skill.",
    { try: [
      "Do a free challenge on CyberDefenders or Blue Team Labs Online that gives you a disk or memory image.",
      "Read one case on The DFIR Report and draw its timeline yourself.",
    ] },
    { check: [
      ["Why collect memory before disk?", "Memory is lost at shutdown and holds things the disk doesn't: running processes, network connections, decrypted data and keys."],
      ["What's a hash used for in forensics?", "Proving that an evidence image hasn't changed since it was collected."],
      ["Is a Shimcache entry proof that a program ran?", "Not on modern Windows; it shows the system noticed the file. Confirm with other artifacts such as Prefetch or event logs."],
    ] },
  ],

  "threat-intel": [
    "Threat intelligence turns information about attackers into decisions: which vulnerabilities to patch first, which detections to build, what to tell the board. Intelligence that doesn't change a decision is just reading.",
    { h: "Three levels" },
    { table: [
      ["Level", "For", "Example"],
      ["Strategic", "Executives and the board", "\"Ransomware groups are targeting Canadian manufacturers through VPN flaws; our exposure is moderate.\""],
      ["Operational", "Security leaders, IR teams", "\"Group X is running a campaign; here's how it works and what to look for.\""],
      ["Tactical", "SOC and detection engineers", "Indicators, ATT&CK techniques and detection ideas"],
    ] },
    { h: "The intelligence cycle" },
    { fig: "intel-cycle", cap: "Intelligence starts with a question from the people who'll use it, and ends with asking them whether it helped." },
    { h: "Why behaviour beats indicators" },
    { fig: "pyramid", cap: "David Bianco's Pyramid of Pain. Blocking a hash costs the attacker nothing; detecting how they work forces them to change their whole approach." },
    { h: "Sources" },
    { ul: [
      "Government advisories: CISA in the US, the Canadian Centre for Cyber Security (CCCS) in Canada.",
      "Vendor research blogs and annual reports from security companies.",
      "Sector sharing groups (ISACs) for finance, health, energy and others.",
      "Your own incidents: the most relevant intelligence you'll ever have.",
      "Sharing formats and platforms: STIX (the format), TAXII (the transport) and MISP (a popular open-source platform).",
    ] },
    { h: "Saying how sure you are" },
    "Analysts use standard words so readers know exactly how confident they are. A common scale comes from US intelligence standards (ICD 203):",
    { table: [
      ["Word", "Roughly"],
      ["Almost certain", "95 to 99%"],
      ["Very likely", "80 to 95%"],
      ["Likely", "55 to 80%"],
      ["Roughly even chance", "45 to 55%"],
      ["Unlikely", "20 to 45%"],
      ["Very unlikely", "5 to 20%"],
    ] },
    { code: R`BOTTOM LINE: We assess it is likely (55-80%) that the phishing wave against our finance team
is the same group CCCS warned about on 3 November. No accounts were compromised.

WHAT WE RECOMMEND: Block the two sender domains (done), require number matching for MFA
push approvals by Friday, and brief finance staff on the invoice lure.

DETAIL: ...`, label: "A short intelligence brief: decision first, detail last" },
    { check: [
      ["Which is more durable to detect: an attacker's IP address or their technique?", "Their technique. IPs change in minutes; changing how they operate is expensive."],
      ["What should the first step of the intelligence cycle be?", "Direction: understanding what the people you serve need to decide."],
    ] },
  ],

  "detection-eng": [
    "Detection engineers build and maintain the alerts the SOC relies on, treating them like software: written in code, reviewed, tested and measured. Threat hunters look for attacks that no alert caught yet, and turn what they find into new detections.",
    { h: "Detection as code" },
    { flow: ["Rule in Git|Sigma, KQL, SPL", "Pull request|peer review", "Automated tests|sample attack logs and normal logs", "Deploy|pipeline pushes to the SIEM", "Measure|alert volume, true-positive rate"], cap: "The same habits as software teams: version control, review, tests and automated releases." },
    { h: "Hypothesis-driven hunting" },
    { flow: ["Hypothesis|what might an attacker be doing here?", "Investigate|query the data", "Find patterns|or rule it out", "Improve|new detection, fixed logging, better baseline"], loop: "the next hunt starts from what you learned" },
    "A hunt starts with a specific, testable idea, ideally based on intelligence about attackers who target your sector:",
    { code: R`// Hypothesis: someone with stolen credentials is using Remote Desktop
// to reach machines that account has never logged in to before.
SecurityEvent
| where TimeGenerated > ago(14d)
| where EventID == 4624 and LogonType == 10
| summarize FirstSeen = min(TimeGenerated), Logons = count() by Account, Computer, IpAddress
| where FirstSeen > ago(1d)`, label: "Microsoft Sentinel KQL: new RDP logon pairs in the last day" },
    "Results either point at something to investigate, or confirm the behaviour isn't happening. Both are useful; a hunt that finds nothing still teaches you what normal looks like and often turns into a detection rule.",
    { h: "Testing detections" },
    "You can't know a rule works until you've seen it fire. Teams replay sample attack logs through rules, and in isolated labs run small, safe tests of specific ATT&CK techniques (such as the open-source Atomic Red Team library) to confirm the right alert appears.",
    { h: "Measuring" },
    { ul: [
      "Coverage of the ATT&CK techniques that matter for your threats.",
      "True-positive rate per rule; rules that never fire or never matter get reviewed.",
      "Time from a new threat report to a tested detection.",
    ] },
    { check: [
      ["What makes a good hunting hypothesis?", "It's specific and testable against data you have, and grounded in how real attackers behave."],
      ["Why keep detection rules in Git?", "History of every change, peer review before deployment, easy rollback and automated testing."],
    ] },
  ],

  "appsec-path": [
    "Application security engineers help developers build software that's hard to break. It's much cheaper to fix a flaw in a design or a pull request than after it's live, so AppSec spreads checks across the whole development process.",
    { fig: "sdlc", cap: "Security activities across the software lifecycle. The arrow is why people say \"shift left\"." },
    { h: "OWASP Top 10:2025" },
    "The OWASP Top 10 is the best-known list of web application risks. The 2025 edition was finalised in January 2026.",
    { table: [
      ["#", "Risk", "In one line"],
      ["A01", "Broken Access Control", "Users can do or see things they shouldn't"],
      ["A02", "Security Misconfiguration", "Unsafe defaults, verbose errors, open storage"],
      ["A03", "Software Supply Chain Failures", "Vulnerable or malicious dependencies and build systems"],
      ["A04", "Cryptographic Failures", "Weak or missing encryption of sensitive data"],
      ["A05", "Injection", "Untrusted input run as code or queries (SQL, commands, scripts)"],
      ["A06", "Insecure Design", "Flaws baked into how a feature was designed"],
      ["A07", "Authentication Failures", "Weak logins, sessions and password handling"],
      ["A08", "Software or Data Integrity Failures", "Trusting updates or data without checking them"],
      ["A09", "Security Logging and Alerting Failures", "Attacks happen and nobody notices"],
      ["A10", "Mishandling of Exceptional Conditions", "Errors and edge cases handled in unsafe ways"],
    ] },
    { h: "The classic fix: parameterised queries" },
    { code: R`# Vulnerable: the email is pasted into the SQL text
cursor.execute(f"SELECT * FROM users WHERE email = '{email}'")

# Safe: the database receives the query and the value separately
cursor.execute("SELECT * FROM users WHERE email = %s", (email,))`, label: "Python, preventing SQL injection" },
    "With a parameterised query, whatever the user types is treated as data, never as part of the SQL command. Most injection flaws are fixed the same way: keep code and data apart.",
    { h: "Threat modelling" },
    "Threat modelling is asking four questions about a design before it's built: What are we working on? What can go wrong? What are we going to do about it? Did we do a good enough job? STRIDE is a handy checklist for the second question.",
    { table: [
      ["Letter", "Threat", "Breaks", "Typical fix"],
      ["S", "Spoofing", "Authentication", "Strong login, MFA"],
      ["T", "Tampering", "Integrity", "Signatures, input validation"],
      ["R", "Repudiation", "Accountability", "Audit logs"],
      ["I", "Information disclosure", "Confidentiality", "Encryption, access control"],
      ["D", "Denial of service", "Availability", "Rate limits, scaling"],
      ["E", "Elevation of privilege", "Authorisation", "Least privilege, server-side checks"],
    ] },
    { h: "Tools in the pipeline" },
    { table: [
      ["Kind", "Finds", "Examples"],
      ["SAST", "Risky patterns in source code", "Semgrep, CodeQL"],
      ["SCA", "Known-vulnerable dependencies", "Dependabot, OSV-Scanner"],
      ["Secret scanning", "Keys and passwords in code", "GitHub secret scanning, Gitleaks"],
      ["DAST", "Flaws in the running app", "OWASP ZAP"],
    ] },
    { check: [
      ["Which OWASP 2025 category is new and covers dependencies and build systems?", "A03 Software Supply Chain Failures."],
      ["Why does a parameterised query stop SQL injection?", "The value is sent separately from the SQL text, so the database never treats it as part of the command."],
      ["In STRIDE, what does the R stand for and what control helps?", "Repudiation: someone denying they did something. Audit logs help prove what happened."],
    ] },
  ],

  "cloudsec-path": [
    "Cloud security engineers design the guardrails that keep hundreds of teams and accounts safe without slowing them down. Much of the job is code: infrastructure as code, policy as code and automation.",
    { fig: "landing-zone", cap: "A multi-account \"landing zone\". AWS Organizations is shown; Azure uses management groups and subscriptions the same way." },
    { h: "Three kinds of guardrail" },
    { table: [
      ["Kind", "Does", "Example"],
      ["Preventive", "Makes the bad thing impossible", "A service control policy that blocks turning off CloudTrail; Azure Policy denying public storage"],
      ["Detective", "Finds it after it happens", "AWS Config rules, Defender for Cloud recommendations, a CSPM tool"],
      ["Corrective", "Fixes it automatically", "A function that removes public access from any new bucket"],
    ] },
    { h: "Security in infrastructure as code" },
    "When infrastructure is written as code (Terraform, Bicep, CloudFormation), security can review and test it before it exists.",
    { code: R`resource "aws_s3_bucket" "logs" {
  bucket = "example-org-central-logs"
}

resource "aws_s3_bucket_public_access_block" "logs" {
  bucket                  = aws_s3_bucket.logs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`, label: "Terraform: a bucket that can't be made public" },
    "Scanners such as Checkov and Trivy check IaC files for risky settings in the pull request, before anything is deployed.",
    { h: "Tools you'll hear about" },
    { terms: [
      ["CSPM", "Cloud security posture management: continuously checks accounts against best practices and benchmarks."],
      ["CNAPP", "Cloud-native application protection platform: CSPM plus workload, container and identity protection in one product."],
      ["CIEM", "Cloud infrastructure entitlement management: finds excess permissions."],
    ] },
    { check: [
      ["What's the difference between a preventive and a detective guardrail?", "Preventive stops the action from happening at all; detective spots it afterwards so someone can fix it."],
      ["Why keep security tooling and logs in separate accounts?", "A compromise of a workload account can't delete the logs or switch off the security tools."],
    ] },
  ],

  "grc-path": [
    "Governance, risk and compliance (GRC) people make sure security is run deliberately: the right policies, risks understood and owned, and proof for auditors, regulators and customers that controls actually work.",
    { h: "The document hierarchy" },
    { fig: "policy-pyramid", cap: "Policies say what and why; standards make it specific; procedures say how; guidelines advise." },
    { h: "Running a risk assessment" },
    { flow: ["Scope|which systems, data, processes", "Identify|threats and vulnerabilities", "Analyse|likelihood and impact", "Evaluate|compare with risk appetite", "Treat|mitigate, transfer, avoid, accept", "Record and review|risk register"], loop: "at least yearly, and after big changes" },
    { table: [
      ["ID", "Risk", "L", "I", "Score", "Owner", "Treatment", "Due"],
      ["R-07", "Ransomware via unpatched VPN appliance", "4", "5", "20", "IT director", "Mitigate: patch within 72 h of release, MFA on VPN", "30 Nov"],
      ["R-12", "Key vendor breach exposes customer data", "2", "4", "8", "Procurement", "Transfer: contract clauses; mitigate: annual vendor review", "Q1"],
      ["R-15", "Laptop theft", "3", "2", "6", "IT manager", "Accept: disks encrypted, residual risk low", "Review yearly"],
    ], cap: "Part of a risk register. L = likelihood, I = impact, each scored 1 to 5." },
    { h: "Audits" },
    { table: [
      ["Audit", "What it is", "Rhythm"],
      ["ISO/IEC 27001 certification", "An accredited body checks your security management system against the standard", "Two-stage initial audit, yearly surveillance audits, recertification every three years"],
      ["SOC 2 Type I", "An auditor's opinion on whether controls are designed well, at one point in time", "Often a first step"],
      ["SOC 2 Type II", "Whether controls actually worked over a period", "Usually covers 3 to 12 months, renewed yearly"],
      ["PCI DSS assessment", "Card-data security, by a qualified assessor or self-assessment", "Yearly"],
    ] },
    "Day to day, GRC work is collecting evidence (screenshots, exports, tickets), reviewing vendors' security, updating policies, tracking risks and audit findings to closure, and explaining all of it in plain language.",
    { check: [
      ["What's the difference between a policy and a standard?", "A policy states the rule and intent and is approved by leadership; a standard sets the specific mandatory requirements that carry it out."],
      ["A customer wants proof your controls worked all last year. SOC 2 Type I or Type II?", "Type II, which tests operating effectiveness over a period."],
    ] },
  ],
});

Object.assign(window.FIGURES, {
  "specialty-map": (g) => {
    const out = [
      g.line(40, 165, 660, 165, "lf"), g.line(355, 24, 355, 310, "lf"),
      g.text(355, 16, "deeply technical", "c s mu"), g.text(355, 326, "people, process and writing", "c s mu"),
      g.text(44, 158, "defend and investigate", "s mu"), g.text(660, 158, "build and break", "e s mu"),
    ];
    const spots = [
      [180, 50, "Detection engineering", "t"],
      [150, 100, "Incident response (DFIR)", "t"],
      [235, 210, "SOC analyst: start here", "d"],
      [165, 262, "Threat intelligence", "t"],
      [575, 50, "Pen testing", "a"],
      [520, 108, "Application security", "a"],
      [480, 212, "Cloud security", "y"],
      [380, 282, "GRC", "m"],
    ];
    spots.forEach(([cx, cy, label, cls]) => {
      const w = Math.round(label.length * 7.3 + 26);
      out.push(g.box(cx - w / 2, cy - 15, w, 30, `!${label}`, cls, 15));
    });
    return g.svg(680, 334, out);
  },

  "volatility": (g) => {
    const rows = [
      ["1  CPU registers and cache", "nanoseconds", "a"],
      ["2  Memory: processes, connections, keys", "until shutdown", "a"],
      ["3  Temporary files and swap", "minutes to hours", "y"],
      ["4  Disk", "until overwritten", "y"],
      ["5  Remote logs: SIEM, firewall, cloud", "days to months", "t"],
      ["6  Backups and archives", "months to years", "t"],
    ];
    const out = [g.text(20, 16, "Collect from the top down: the top of the list disappears first", "s b")];
    rows.forEach(([label, lasts, cls], i) => {
      const y = 28 + i * 44;
      const w = 360 + i * 56;
      out.push(g.rect(20, y, w, 36, cls, 6), g.text(34, y + 22.5, label, "s b"), g.text(20 + w - 12, y + 22.5, lasts, "e s mu"));
    });
    return g.svg(680, 296, out);
  },

  "intel-cycle": (g) => {
    const steps = [
      [340, 45, ["!1  Direction", "~what do leaders need?"], "y"],
      [539, 102, ["!2  Collection", "~reports, logs, feeds"], "m"],
      [539, 218, ["!3  Processing", "~clean, translate, sort"], "m"],
      [340, 275, ["!4  Analysis", "~so what? how sure?"], "a"],
      [141, 218, ["!5  Dissemination", "~brief the right people"], "t"],
      [141, 102, ["!6  Feedback", "~did it help?"], "t"],
    ];
    const out = steps.map(([cx, cy, label, cls]) => g.box(cx - 85, cy - 25, 170, 50, label, cls));
    out.push(
      g.path("M425 50 Q500 55 525 76", "ar"), g.arrow(539, 127, 539, 192), g.path("M525 244 Q500 268 426 272", "ar"),
      g.path("M254 272 Q180 268 155 244", "ar"), g.arrow(141, 193, 141, 128), g.path("M155 76 Q180 55 254 50", "ar"),
      g.text(340, 156, "The intelligence cycle", "c b"), g.text(340, 174, "it starts with a question", "c s mu"),
    );
    return g.svg(680, 312, out);
  },

  "pyramid": (g) => {
    const top = 15;
    const base = 290;
    const cx = 220;
    const half = 180;
    const levels = [
      ["TTPs", "Tough!", "they must change how they operate", "r"],
      ["Tools", "Challenging", "they must find or build new tools", "a"],
      ["Artifacts", "Annoying", "host and network traces change", "a"],
      ["Domain names", "Simple", "register a new domain", "y"],
      ["IP addresses", "Easy", "switch to a new server", "y"],
      ["Hash values", "Trivial", "recompile, new hash", "m"],
    ];
    const step = (base - top) / levels.length;
    const hw = (y) => (half * (y - top)) / (base - top);
    const out = [g.text(420, 16, "Pain for the attacker when you detect it", "s b")];
    levels.forEach(([name, pain, why, cls], i) => {
      const y1 = top + i * step;
      const y2 = y1 + step;
      const pts = i === 0
        ? `${cx},${y1} ${cx + hw(y2)},${y2} ${cx - hw(y2)},${y2}`
        : `${cx - hw(y1)},${y1} ${cx + hw(y1)},${y1} ${cx + hw(y2)},${y2} ${cx - hw(y2)},${y2}`;
      const mid = (y1 + y2) / 2;
      const tone = cls === "r" ? " on" : "";
      out.push(g.poly(pts, cls), g.text(cx, i === 0 ? y2 - 9 : mid + 4.5, name, `c s b${tone}`));
      out.push(g.line(cx + hw(mid) + 6, mid, 412, mid, "lf"), g.text(420, mid - 3, pain, "s b"), g.text(420, mid + 13, why, "s mu"));
    });
    return g.svg(680, 300, out);
  },

  "sdlc": (g) => {
    const stages = [
      ["Plan", ["^threat model", "^security", "^requirements"]],
      ["Code", ["^secure coding", "^code review"]],
      ["Build", ["^SAST", "^dependency scan", "^secret scan"]],
      ["Test", ["^DAST", "^pen test"]],
      ["Release", ["^signed builds", "^SBOM"]],
      ["Run", ["^WAF, logging", "^bug bounty"]],
    ];
    const out = [];
    stages.forEach(([name, acts], i) => {
      const x = 8 + i * 112;
      out.push(g.box(x, 20, 100, 40, `!${name}`, "d"), g.box(x, 72, 100, 74, acts, i < 3 ? "a" : "t"));
      if (i < stages.length - 1) out.push(g.arrow(x + 100, 40, x + 111, 40));
    });
    out.push(
      g.path("M650 168 H30", "ar ac"),
      g.text(340, 190, "shift left: a flaw found while planning or coding costs far less to fix than one found in production", "c s ac"),
    );
    return g.svg(680, 202, out);
  },

  "landing-zone": (g) => {
    const out = [g.box(230, 12, 220, 50, ["!Organization root", "~management account: billing only"], "d"), g.line(340, 62, 340, 86), g.line(90, 86, 585, 86)];
    const ous = [
      [15, "Security", "a", [["^Log", "^archive"], ["^Security", "^tools"]]],
      [180, "Infrastructure", "m", [["^Network", "^hub"], ["^Shared", "^services"]]],
      [345, "Workloads", "t", [["^Prod"], ["^Dev and", "^test"]]],
      [510, "Sandbox", "y", [["^Personal sandboxes", "~cleaned up monthly"]]],
    ];
    ous.forEach(([x, name, cls, accounts]) => {
      out.push(g.line(x + 75, 86, x + 75, 106), g.box(x, 106, 150, 40, `!OU: ${name}`, cls));
      if (accounts.length === 2) {
        out.push(g.path(`M${x + 75} 146 V160 H${x + 36} V176 M${x + 75} 160 H${x + 114} V176`));
        accounts.forEach((label, j) => out.push(g.box(x + j * 78, 176, 72, 50, label)));
      } else {
        out.push(g.line(x + 75, 146, x + 75, 176), g.box(x, 176, 150, 50, accounts[0]));
      }
    });
    out.push(
      g.text(340, 256, "Guardrails such as AWS service control policies or Azure Policy attach to an OU,", "c s mu"),
      g.text(340, 272, "so every account inside inherits them: logging stays on, approved regions only, no public storage.", "c s mu"),
    );
    return g.svg(680, 284, out);
  },

  "policy-pyramid": (g) => {
    const rows = [
      [270, ["!Policy: the rule and why", "~approved by leadership, rarely changes"], "d"],
      [370, ["!Standards: mandatory specifics", "~e.g. MFA on every account, disks encrypted"], "a"],
      [470, ["!Procedures: step-by-step how", "~e.g. how to set up a new hire's accounts"], "t"],
      [570, ["!Guidelines: recommended, not mandatory", "~e.g. tips for spotting phishing"], "m"],
    ];
    return g.svg(680, 258, rows.map(([w, label, cls], i) => g.box(340 - w / 2, 14 + i * 60, w, 52, label, cls)));
  },
});
})();
