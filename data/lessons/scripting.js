"use strict";

/* Step 4: Scripting and automation. */
(() => {
const R = String.raw;

Object.assign(window.LESSONS, {
  "scripting": [
    "Security teams drown in data: millions of log lines, thousands of alerts, lists of vulnerable machines. Scripting is how one analyst does in five minutes what would take a day by hand. You don't need to be a software developer, but you do need to read and write small scripts comfortably.",
    { fig: "automation", cap: "Almost every security script has the same shape: read data, pick out what matters, add context, then do something with it." },
    { h: "Which language for what" },
    { table: [
      ["Language", "Best for", "Typical security task"],
      ["Python", "Anything bigger than a one-liner; APIs; data", "Pull alerts from an EDR API, enrich them with threat intel and write a report"],
      ["Bash", "Quick work on Linux; chaining tools", "Count failed SSH logins per IP in a log file"],
      ["PowerShell", "Windows, Active Directory, Microsoft 365, Azure", "List every user who hasn't logged in for 90 days"],
    ] },
    { h: "How to get good" },
    { ul: [
      "Automate something you actually do. Real problems teach faster than exercises.",
      "Read other people's scripts before you run them. It's a security habit as much as a learning one.",
      "AI assistants are fine for drafts, but understand every line before you trust it. Wrong scripts can delete data or lock accounts.",
      "Keep everything in Git, even small scripts. See [[git|Git and GitHub]].",
    ] },
    { check: [
      ["You need to list every Active Directory user whose password never expires. Which language would you reach for?", "PowerShell, with the ActiveDirectory module (`Get-ADUser`)."],
      ["Why read a script before running it, even from a colleague?", "It could do something destructive or unexpected, and scripts from the internet can be malicious. You're responsible for what you run."],
    ] },
  ],

  "python": [
    { h: "The parts you'll actually use" },
    { table: [
      ["Piece", "What for"],
      ["Variables, lists, dictionaries", "Holding data: a list of IPs, a dict of counts per user"],
      ["Loops and if statements", "Going through log lines and picking out matches"],
      ["Functions", "Reusing a piece of logic, such as \"is this IP private?\""],
      ["Reading and writing files", "Logs in, reports out"],
      ["`re` (regular expressions)", "Pulling fields out of messy text"],
      ["`json` and `csv`", "Reading tool exports and writing results"],
      ["`requests`", "Calling REST APIs"],
      ["`collections.Counter`", "Counting things in one line"],
      ["`argparse`", "Turning a script into a proper command-line tool"],
    ] },
    { h: "Example: top attackers in an SSH log" },
    { code: R`import re
from collections import Counter

# Matches lines such as:
# "Failed password for invalid user admin from 203.0.113.45 port 52144 ssh2"
PATTERN = re.compile(r"Failed password for (?:invalid user )?\S+ from (\d{1,3}(?:\.\d{1,3}){3})")

counts = Counter()
with open("auth.log", encoding="utf-8", errors="replace") as log:
    for line in log:
        match = PATTERN.search(line)
        if match:
            counts[match.group(1)] += 1

for ip, n in counts.most_common(10):
    print(f"{n:6}  {ip}")`, label: "top_failed_logins.py" },
    "Read it top to bottom: build a pattern once, go through the file a line at a time (so even a huge log doesn't fill memory), count the IP address from each match, then print the ten biggest counts.",
    { h: "Example: new known-exploited vulnerabilities this week" },
    "CISA publishes its Known Exploited Vulnerabilities catalogue as a JSON feed. This script lists anything added in the last seven days for vendors your company uses.",
    { code: R`import requests
from datetime import date, timedelta

URL = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"
WATCH = {"microsoft", "fortinet", "cisco"}   # vendors your company uses

data = requests.get(URL, timeout=30).json()
since = date.today() - timedelta(days=7)

for vuln in data["vulnerabilities"]:
    added = date.fromisoformat(vuln["dateAdded"])
    if added >= since and vuln["vendorProject"].lower() in WATCH:
        print(vuln["dateAdded"], vuln["cveID"], vuln["vendorProject"], vuln["product"])`, label: "kev_this_week.py" },
    { tip: "Install libraries into a virtual environment so projects don't clash: `python -m venv .venv`, activate it, then `pip install requests`." },
    { try: [
      "Download a sample auth.log from a blue team lab, or generate one by failing SSH logins against your lab VM.",
      "Run the first script on it.",
      "Extend it: also count which usernames were tried, and write both lists to a CSV file with the `csv` module.",
    ] },
    { check: [
      ["Why read a log file line by line instead of all at once?", "Logs can be gigabytes. Reading one line at a time keeps memory use small."],
      ["What does `Counter.most_common(10)` return?", "The ten most frequent items with their counts, biggest first."],
      ["Why pass `timeout=30` to `requests.get`?", "Without a timeout, a slow or dead server can make the script hang forever."],
    ] },
  ],

  "bash": [
    { h: "Pipes: small tools joined together" },
    "The Unix idea is that each tool does one thing, and the pipe `|` sends one tool's output into the next. Chaining five tiny commands answers questions that would otherwise need a script.",
    { code: R`grep "Failed password" /var/log/auth.log \
  | grep -oE "from [0-9.]+" \
  | awk '{print $2}' \
  | sort | uniq -c | sort -rn | head`, label: "Top IPs with failed SSH logins" },
    { flow: ["`grep \"Failed password\"`|keep matching lines", "`grep -oE \"from [0-9.]+\"`|keep only \"from 203.0.113.45\"", "`awk '{print $2}'`|keep the IP", "`sort`|line up equal IPs", "`uniq -c`|count each", "`sort -rn`|biggest first", "`head`|top 10"], cap: "What each stage of that pipeline does." },
    { h: "The tools" },
    { table: [
      ["Tool", "Does", "Example"],
      ["`grep`", "Find lines matching a pattern", "`grep -i \"error\" app.log`"],
      ["`cut`", "Take columns by delimiter", "`cut -d, -f2 users.csv`"],
      ["`awk`", "Take columns by whitespace, do small sums", "`awk '{print $1}' access.log`"],
      ["`sed`", "Find and replace in a stream", "`sed 's/http:/https:/g' links.txt`"],
      ["`sort`, `uniq -c`", "Order lines; count duplicates", "`sort ips.txt | uniq -c`"],
      ["`wc -l`", "Count lines", "`grep 404 access.log | wc -l`"],
      ["`head`, `tail`", "First or last lines", "`tail -n 50 syslog`"],
    ] },
    { h: "Redirection" },
    { table: [
      ["Symbol", "Means"],
      ["`>`", "Write output to a file (replacing it)"],
      ["`>>`", "Append to a file"],
      ["`2>`", "Send errors somewhere, e.g. `2>/dev/null` to hide them"],
      ["`|`", "Send output to the next command"],
      ["`&&`", "Run the next command only if this one succeeded"],
      ["`||`", "Run the next command only if this one failed"],
    ] },
    { h: "A small script" },
    { code: R`#!/usr/bin/env bash
# Report whether key services are running.
set -euo pipefail

for svc in ssh cron rsyslog; do
  if systemctl is-active --quiet "$svc"; then
    echo "OK    $svc"
  else
    echo "DOWN  $svc"
  fi
done`, label: "check_services.sh" },
    "`set -euo pipefail` makes the script stop on errors and on unset variables instead of carrying on blindly. Quote your variables (`\"$svc\"`) so names with spaces don't break things. Make it runnable with `chmod +x check_services.sh`.",
    { tip: "ShellCheck (shellcheck.net, or the `shellcheck` package) points out common Bash mistakes. Run it on every script you write." },
    { check: [
      ["Why does `uniq -c` need `sort` before it?", "`uniq` only collapses duplicate lines that are next to each other, so they need sorting first."],
      ["How would you count the lines containing \"404\" in access.log?", "`grep 404 access.log | wc -l` (or `grep -c 404 access.log`)."],
      ["What does `2>/dev/null` do?", "Throws away error messages, such as permission-denied noise from `find`."],
    ] },
  ],

  "powershell": [
    { h: "Objects, not text" },
    "Bash passes text between commands. PowerShell passes objects with named properties, so you sort and filter by property instead of cutting columns out of text.",
    { code: R`# Five processes that have used the most CPU time
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 Name, Id, CPU

# Services set to start automatically that aren't running
Get-Service | Where-Object { $_.StartType -eq 'Automatic' -and $_.Status -ne 'Running' }`, label: "PowerShell" },
    "`$_` means \"the current object in the pipeline\". Commands are named Verb-Noun, so you can often guess them: `Get-LocalUser`, `Get-ScheduledTask`, `Stop-Process`. `Get-Help <command> -Examples` shows how to use one.",
    { h: "Querying the event log" },
    { code: R`# Failed logons in the last day, counted by account name (run as administrator)
$since = (Get-Date).AddDays(-1)
Get-WinEvent -FilterHashtable @{ LogName = 'Security'; Id = 4625; StartTime = $since } |
  ForEach-Object {
    $fields = ([xml]$_.ToXml()).Event.EventData.Data
    ($fields | Where-Object Name -eq 'TargetUserName').'#text'
  } |
  Group-Object | Sort-Object Count -Descending | Select-Object -First 10 Count, Name`, label: "Who is being password-guessed?" },
    "Converting each event to XML and reading fields by name is more reliable than parsing the message text, which changes with the system language.",
    { h: "Reading suspicious PowerShell safely" },
    "Attackers use PowerShell because it's on every Windows machine. A common trick is `-EncodedCommand`, which hides the script as Base64 of UTF-16LE text. Decode it to read it; never run it to find out.",
    { code: R`$b64 = 'VwByAGkAdABlAC0ASABvAHMAdAAgACcAaABlAGwAbABvACcA'
[System.Text.Encoding]::Unicode.GetString([Convert]::FromBase64String($b64))
# Output: Write-Host 'hello'`, label: "Decoding an encoded command" },
    { ul: [
      "CyberChef does the same with From Base64 then Decode text (UTF-16LE).",
      "Script block logging (event 4104) records the decoded code that actually ran, which is why defenders switch it on.",
      "The execution policy is not a security boundary; Microsoft says so itself. It stops accidents, not attackers.",
    ] },
    { h: "Managing many machines" },
    "PowerShell remoting (`Enter-PSSession`, `Invoke-Command`) runs commands on other machines over WinRM, on ports 5985 (HTTP) and 5986 (HTTPS). Admins use it to manage fleets; attackers who steal admin credentials use it to move around, so SOCs watch for remoting from unusual machines.",
    { check: [
      ["What does `$_` mean inside `Where-Object { }`?", "The current object coming down the pipeline."],
      ["You find `powershell.exe -enc <long string>` in a process tree. What do you do?", "Copy the string and decode it as Base64 UTF-16LE (in CyberChef or PowerShell) to read it. Don't run it. Then check event 4104 for what actually executed."],
      ["Is the PowerShell execution policy a security control?", "No. It prevents accidental script runs but is easy to bypass on purpose."],
    ] },
  ],

  "data-formats": [
    { h: "JSON" },
    "Nearly every security tool exports JSON and every API returns it. It's just nested key-value pairs and lists.",
    { code: R`{
  "alerts": [
    { "id": 101, "severity": "high", "host": "WS-0142", "rule": "Office spawned PowerShell" },
    { "id": 102, "severity": "low",  "host": "WS-0077", "rule": "New USB device" },
    { "id": 103, "severity": "high", "host": "FILE01",  "rule": "Security log cleared" }
  ]
}`, label: "alerts.json" },
    { code: R`jq -r '.alerts[] | select(.severity == "high") | .host' alerts.json
# WS-0142
# FILE01`, label: "Filtering it with jq" },
    { code: R`import json

with open("alerts.json", encoding="utf-8") as f:
    data = json.load(f)

print([a["host"] for a in data["alerts"] if a["severity"] == "high"])
# ['WS-0142', 'FILE01']`, label: "The same in Python" },
    { h: "Regular expressions" },
    "A regex is a pattern for matching text. You'll meet them in log searches, detection rules, Python and grep. Learn the basics; look up the rest.",
    { table: [
      ["Pattern", "Matches"],
      ["`.`", "Any one character"],
      ["`\\d`, `\\w`, `\\s`", "A digit, a word character, a space or tab"],
      ["`*`, `+`, `?`", "Zero or more, one or more, zero or one of the previous thing"],
      ["`{2,4}`", "Between 2 and 4 of the previous thing"],
      ["`[abc]`, `[^abc]`", "One of a, b or c; anything except them"],
      ["`^`, `$`", "Start and end of the line"],
      ["`( )`, `|`", "Group; either/or"],
      ["`\\.`", "A real dot (escaped)"],
    ] },
    { table: [
      ["Want", "Regex"],
      ["An IPv4 address (loosely)", "`\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b`"],
      ["A Windows failed logon in a text export", "`EventCode=4625`"],
      ["Lines that start with an error level", "`^(ERROR|CRITICAL)`"],
      ["An email address (good enough for logs)", "`[\\w.+-]+@[\\w-]+\\.[\\w.]+`"],
    ] },
    { tip: "Test patterns on a site such as regex101 with real sample lines before putting them into a detection rule. A careless `.*` can match far more than you meant." },
    { h: "APIs" },
    "A REST API is a web address that returns data instead of a page. You send a request with a method (GET to read, POST to create), usually an API key in a header, and get JSON back.",
    { code: R`# Read the key from an environment variable; never paste it into the script
curl -s -H "Authorization: Bearer $API_TOKEN" \
     -H "Accept: application/json" \
     "https://api.example.com/v1/alerts?status=open&limit=50"`, label: "Calling an API with curl" },
    { table: [
      ["Response", "Means"],
      ["200", "Here's your data"],
      ["401", "Your key is missing or wrong"],
      ["403", "Your key is valid but not allowed to do that"],
      ["429", "Too many requests: slow down and retry later"],
    ] },
    { warn: "API keys are passwords. Keep them in environment variables or a secrets manager, give them the fewest permissions possible, and never commit them to Git." },
    { check: [
      ["Write a regex that matches \"4624\" or \"4625\".", "`462[45]` (or `4624|4625`)."],
      ["An API returns 429. What should your script do?", "Wait and retry more slowly, ideally honouring the Retry-After header if there is one."],
      ["In jq, what does `.alerts[]` do?", "Goes through each item in the alerts list, one at a time."],
    ] },
  ],

  "git": [
    { h: "How Git thinks" },
    { flow: ["Working folder|you edit files", "Staging area|`git add`", "Local history|`git commit`", "GitHub|`git push`"], cap: "Changes move from your folder into a commit, then up to a shared copy. `git pull` brings other people's commits down." },
    { code: R`git clone https://github.com/you/detections.git
cd detections
git switch -c office-child-process       # a branch for your change
git add rules/office-child-process.yml
git commit -m "Detect Office apps starting a shell"
git push -u origin office-child-process  # then open a pull request on GitHub`, label: "A typical change" },
    { h: "Branches and pull requests" },
    "A branch is a separate line of work. A pull request asks for it to be merged into the main branch, and gives teammates a place to review it first. Teams that keep detection rules or cloud settings in Git (\"as code\") get a history of every change, a review before anything goes live, and an easy undo.",
    { h: "Keep secrets out" },
    { code: R`.env
*.pem
*.key
secrets/`, label: ".gitignore" },
    { warn: "If you commit a password or key, deleting it in the next commit isn't enough: it's still in the history, and public repositories are scanned by bots within minutes. Revoke or rotate the secret first, then clean the history." },
    "GitHub's push protection blocks many known key formats before they leave your machine. It's a safety net, not a plan.",
    { h: "Git for your career" },
    "A GitHub profile with a few honest projects (a log parser, your home lab notes, a set of detection rules with test data) gives an interviewer something real to ask about. See [[portfolio|Home lab and portfolio]].",
    { check: [
      ["What's the difference between `git commit` and `git push`?", "Commit saves a snapshot to your local history; push uploads your commits to the remote, such as GitHub."],
      ["You pushed an AWS key to a public repo an hour ago and deleted it since. Are you safe?", "No. It's still in the history and may already have been copied. Deactivate the key immediately, check for misuse, then clean the history."],
    ] },
  ],
});

Object.assign(window.FIGURES, {
  "automation": (g) => {
    const inputs = [["!Log files", "~auth.log, .evtx"], ["!APIs", "~EDR, SIEM, threat intel"], ["!Exports", "~CSV, JSON"]];
    const outputs = [["!Report", "~CSV or email"], ["!Ticket", "~for a human to check"], ["!Alert", "~sent to team chat"], ["!Action", "~block IP, disable user"]];
    const out = [g.box(250, 50, 180, 112, ["!Your script", "~1. read", "~2. parse and filter", "~3. add context", "~4. decide and act"], "d")];
    inputs.forEach((label, i) => {
      const y = 22 + i * 60;
      out.push(g.box(15, y, 170, 42, label, "m"), g.arrow(185, y + 21, 249, 106));
    });
    outputs.forEach((label, i) => {
      const y = 10 + i * 52;
      out.push(g.box(515, y, 150, 42, label, i === 3 ? "a" : "t"), g.arrow(430, 106, 514, y + 21));
    });
    return g.svg(680, 220, out);
  },
});
})();
