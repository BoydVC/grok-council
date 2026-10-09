/** Grok Council mock reply banks — keyword-keyed, witty distinct voices. No network. */
window.GC_MOCK = {
  seeds: [
    "Should I run local LLMs for fleet bots, or stick with cloud?",
    "What's a sane morning digest cadence for personal AI agents?",
    "Weekend sports watch: Ravens + Chelsea + Terps — one screen or three tabs?",
    "Kid-friendly coding projects Char and Vic could finish in a Saturday afternoon?",
    "How aggressive should token-max builds be mid-week vs reset day?",
    "Is a personal bot island dashboard worth the maintenance tax?",
    "Should fleet routines page me for failures, or only for surprises?",
    "Best way to pressure-test a new agent skill before trusting it overnight?"
  ],
  topics: {
    local_llm: {
      keys: ["local llm", "local llms", "on-device", "m5", "dgx", "bonsai", "cloud"],
      grok: {
        r1: "Local for the boring loops, cloud for the weird ones. Fleet bots aren't writing novels — they're checking calendars and nagging you about usage. Keep the chatty stuff cheap and local; rent the smarts when a decision actually matters.",
        r2: "Claude's privacy point is fair, but also: your box already holds the routines. The risk isn't 'cloud sees my digest' — it's 'I overbuild a mini-datacenter for a toaster job.' Start hybrid: local drafts, cloud tie-breakers.",
        r3: "Vote: hybrid. Local default, cloud escalate. Winner frame: cost + latency, not ideology."
      },
      claude: {
        r1: "I'd separate workloads. Sensitive personal ops (calendar, family logistics) lean local if quality is good enough. Creative or open-ended reasoning can stay cloud. Caveat: local models drift; you'd need evals and a rollback path.",
        r2: "Grok's hybrid is right-shaped, but 'escalate to cloud' needs clear triggers — otherwise everything escalates. Define: failure, low confidence, or dollar-impact decisions only.",
        r3: "Consensus lean: hybrid with explicit escalation rules and a weekly quality check. I dissent slightly on speed-of-migration — pilot one bot family first."
      },
      codex: {
        r1: "Implementation checklist: (1) pick one high-volume routine, (2) A/B local vs cloud for 7 days, (3) log latency + failure rate + $ cost, (4) promote winners. Don't re-architect the fleet on vibes.",
        r2: "Agree with hybrid. Ship a tiny router: if prompt tokens < N and task in allowlist → local; else cloud. Add a force-cloud flag for debug.",
        r3: "Ship the router + one pilot. Consensus: hybrid. Frame won by measurable ops, not brand loyalty."
      }
    },
    digest: {
      keys: ["digest", "morning", "cadence", "briefing", "summary"],
      grok: {
        r1: "One punchy digest at 7:45 AM ET. If it takes longer to read than brushing your teeth, it's theater. Surprises only after that — silence is a feature.",
        r2: "Claude wants buckets; fine. But three digests is how you recreate email. Collapse to: morning pack + rare interrupt channel.",
        r3: "Consensus: daily AM digest + interrupt-only for fires. Frame: attention budget."
      },
      claude: {
        r1: "Cadence should match decision windows. Morning for day-of logistics; optional evening for tomorrow's prep. Midday only if something is waiting on you. Over-notifying trains you to ignore everything.",
        r2: "I'll meet Grok halfway: one primary morning digest, with clear sections (calendar, sports, bots, money surprises). No free-form essays.",
        r3: "Agree on single morning digest + strict interrupt rules. Caveat: weekends shorter; sports days may need a Sunday pack."
      },
      codex: {
        r1: "Config: `digest.cron = 7:45 ET weekdays`, sections max 5 bullets each, hard char cap. Interrupt channel = pager for failures + surprise charges only.",
        r2: "Add a 'quiet hours' flag and a dry-run mode that writes digests to a local folder before enabling sends.",
        r3: "Implement caps + quiet hours first. Consensus with Grok/Claude on one morning digest."
      }
    },
    sports: {
      keys: ["ravens", "chelsea", "terps", "orioles", "sports", "weekend", "watch"],
      grok: {
        r1: "One screen, three layers: live score strip on top, active game big, other two as picture-in-picture or delayed. Tabs are how you miss the touchdown while refreshing Chelsea.",
        r2: "Codex's 'modes' idea is good — Sunday Mode vs Midweek Mode. Don't build a second ESPN.",
        r3: "Consensus: one dashboard with game-priority focus. Frame: don't miss the moment."
      },
      claude: {
        r1: "Depends on concurrency. If two games overlap, a single prioritized view beats three frantic tabs. If staggered, tabs are fine. Also: mute notifications during kids' homework blocks.",
        r2: "Agree with a sports desk view — but keep it read-only and local so it doesn't become another login maze.",
        r3: "Yes to one screen with priority. Mild dissent: keep a simple fallback list for away weekends."
      },
      codex: {
        r1: "Build modes: `sunday`, `midweek`, `offseason`. Layout = primary game + strip. Data = static/research files first; live APIs later if needed.",
        r2: "Ship the strip + focus pane offline. Deep links to team pages optional.",
        r3: "Checklist: modes, strip, focus. Consensus: one screen."
      }
    },
    kids_code: {
      keys: ["kid", "char", "vic", "coding", "saturday", "project", "tutor"],
      grok: {
        r1: "Ship toys, not curricula. Vic: a tiny soccer score bug that moves. Char: a story generator that insults your typing (nicely). Done in one afternoon beats a half-finished 'platform'.",
        r2: "Claude's scaffolding is wise — but if setup takes 40 minutes, you've lost Saturday. Prebake the starter on the laptop.",
        r3: "Consensus: one small game/tool each, prebaked starter, celebrate screenshots. Frame: finish > fancy."
      },
      claude: {
        r1: "Match independence levels. Vic thrives with clear steps and visible feedback; Char can handle slightly more open prompts if the goal is concrete. Keep it offline-friendly and avoid accounts.",
        r2: "Agree on prebaked starters. Add a 5-minute demo script so a grandparent can help without knowing JS.",
        r3: "Support finishable Saturday projects with a helper card. Soft caveat: no pressure if sports win the afternoon."
      },
      codex: {
        r1: "Repo-shaped: `starter/` with run.html, 3 TODOs marked `// YOUR CODE`, and a smoke check. Themes: Hornets bug (Vic), word scramble (Char).",
        r2: "Preinstall Node-free: pure HTML/JS file://. Checklist printed on the fridge board.",
        r3: "Ship two starters + checklist. Consensus: finishable toys."
      }
    },
    tokenmax: {
      keys: ["token", "usage", "reset", "build", "mid-week", "pace"],
      grok: {
        r1: "Pace like a sane athlete. Straight-line to ~95% by reset, small ships all week. Heroics on Thursday afternoon are how you invent unused pool mythology.",
        r2: "Claude's risk note: yes, don't burn Models pool on doodles. Grok Bot pool = fun ships; save the heavy cloud stuff.",
        r3: "Consensus: daily pace checks + small self-contained builds. Frame: no more empty-tank Thursdays."
      },
      claude: {
        r1: "Separate pools mentally. Burn the weekly play pool on modest, shippable toys. Keep monthly/cloud capacity for something that needs a PR. Always leave a wrap-up message early so failures don't go silent.",
        r2: "Agree with pacing. Add a hard stop rule: if a build hits resource errors, ship working slice and shrink — never restart from zero late.",
        r3: "Yes to paced small builds + early wrap-ups. Dissent: avoid stacking four big ideas the same afternoon."
      },
      codex: {
        r1: "Automation: morning + midday usage check vs straight-line target; if behind, spawn one shortlist build ≤ keyboard-kickoff scale. Thursday safety net = polish only.",
        r2: "Encode: checkpoint often, `dist/` first, screenshots best-effort. Escape-room-size work only on end-of-week push slots.",
        r3: "Implement pace bots + size caps. Consensus with the room."
      }
    },
    bot_island: {
      keys: ["bot island", "dashboard", "maintenance", "fleet", "island"],
      grok: {
        r1: "Worth it if it makes the fleet legible at a glance. Not worth it if you spend more time feeding the island than the bots do work. One living map > twelve status pages.",
        r2: "Codex is right: freeze scope. Cute walk-cycles don't need a second rewrite this month.",
        r3: "Consensus: keep the island, freeze features, measure glance value. Frame: visibility ROI."
      },
      claude: {
        r1: "Maintenance tax is real. Prefer read-only views over write paths. If metadata already exists, a dashboard is cheap; if it needs new collectors weekly, pause.",
        r2: "Agree on freeze. Document what 'done' means so future bots don't reopen the theme park.",
        r3: "Keep it as a glance layer. Caveat: archive experiments that aren't opened in 30 days."
      },
      codex: {
        r1: "Define SLOs: opens/week, time-to-understand a failed routine, collector runtime. If opens ≈ 0, mothball. If useful, pin port + README and stop feature creep.",
        r2: "Add a weekly health card instead of new islands. Reuse collector.",
        r3: "Ship freeze + health card. Consensus: keep, don't expand."
      }
    },
    paging: {
      keys: ["page", "pager", "fail", "failure", "surprise", "alert", "notify"],
      grok: {
        r1: "Page for surprises and blocked humans. Failures can go to a digest unless they strand something time-critical. Constant red dots make you colorblind.",
        r2: "Claude's severity ladder is the move. Codex should wire it, not invent a new Slack personality.",
        r3: "Consensus: severity ladder; page only P0/P1. Frame: protect attention."
      },
      claude: {
        r1: "Severity ladder: P0 page now (blocked decision / money surprise), P1 same-day, P2 digest. Failures without user impact shouldn't buzz your phone during dinner.",
        r2: "Agree with Grok on surprises. Add: quiet hours + Miranda-relevant items only via agreed channels.",
        r3: "Yes to ladder + quiet hours. Soft dissent: sports logistics may feel P1 even if not 'system' failures."
      },
      codex: {
        r1: "Implement `severity` on routine results. Mapper: unexpected charge / waiting-on-Boyd → page; routine retry success → log only.",
        r2: "Unit-test the mapper with canned events. No network send in dry-run.",
        r3: "Ship mapper + quiet hours config. Consensus: page sparingly."
      }
    },
    skill_test: {
      keys: ["skill", "pressure-test", "overnight", "trust", "eval", "dry-run"],
      grok: {
        r1: "Dry-run in daylight, then a supervised evening, then overnight. If it needs your vibe-check every 20 minutes, it's not ready to sleep alone.",
        r2: "Claude's eval harness + Codex's checklist = the adult path. Skip the 'YOLO in prod' chapter.",
        r3: "Consensus: staged trust. Frame: earn overnight rights."
      },
      claude: {
        r1: "Pressure-test with fixed fixtures: happy path, missing permission, partial failure, empty input. Score: did it ask vs invent? Did it stay read-only when told?",
        r2: "Add a blast-radius note: which accounts/files it can touch. Overnight only if blast radius is local or draft-only.",
        r3: "Agree on staged rollout. Caveat: one skill at a time overnight."
      },
      codex: {
        r1: "Harness: `fixtures/` + smoke script + 'no send' assert. Promote: local → supervised → overnight cron.",
        r2: "Log tool calls to a transcript; fail the skill if a disallowed tool name appears.",
        r3: "Ship harness + allowlist. Consensus: staged trust."
      }
    }
  },
  fallback: {
    grok: {
      r1: "Hot take: pick the option that preserves future optionality and doesn't create a second job. If both sides feel clever, choose the boring one.",
      r2: "I'm refining toward 'smallest reversible step.' Grand strategies are how weekends disappear.",
      r3: "Vote: reversible default. Frame: optionality."
    },
    claude: {
      r1: "I'd clarify success criteria, constraints (time, attention, risk), and what 'good enough' looks like before optimizing. Ambiguous goals produce confident nonsense.",
      r2: "Given the room: favor a pilot with an explicit stop/continue rule. Document assumptions that are guesses vs verified.",
      r3: "Lean consensus on a small pilot. Dissent if the cost of waiting is higher than a careful trial."
    },
    codex: {
      r1: "Break it down: goal → constraints → 3-step pilot → metric → ship/abort. Write the abort condition first.",
      r2: "Implement the pilot checklist and a one-page decision log. No new infra unless the metric demands it.",
      r3: "Checklist wins. Consensus: pilot then decide."
    }
  }
};
