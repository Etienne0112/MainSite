"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Filter = "all" | "live" | "planned";

type WorkspaceSite = {
  index: number;
  name: string;
  mark: string;
  description: string;
  tags: string[];
  status: "live" | "planned";
  accent: "red" | "blue" | "acid" | "ink";
  url?: string;
  repository?: string;
};

type NetworkLink = {
  name: string;
  mark: string;
  label: string;
  url: string;
  accent: "red" | "blue" | "acid" | "ink";
};

const mainSiteUrl = "https://etienne0112.github.io/MainSite/";
const mainRepositoryUrl = "https://github.com/Etienne0112/MainSite";
const workspaceCapacity = 20;

const activeSites: WorkspaceSite[] = [
  {
    index: 1,
    name: "DesertRose's Blog",
    mark: "DR",
    description: "짧게 적어 둔 개발 기록. C++, 게임 개발, 알고리즘과 시행착오를 모아 둔 필드 노트.",
    tags: ["C++", "GAME DEV", "FIELD NOTES"],
    status: "live",
    accent: "red",
    url: "https://etienne0112.github.io/DesertRose-s-Blog/",
    repository: "https://github.com/Etienne0112/DesertRose-s-Blog",
  },
  {
    index: 2,
    name: "Study Archive",
    mark: "SA",
    description: "공부하면서 쌓아 둔 긴 문서. 주제별 기록을 차곡차곡 정리한 학습 아카이브.",
    tags: ["STUDY", "LONG NOTES", "ARCHIVE"],
    status: "live",
    accent: "blue",
    url: "https://etienne0112.github.io/Study/",
    repository: "https://github.com/Etienne0112/Study",
  },
  {
    index: 3,
    name: "MicroGame3D",
    mark: "M3D",
    description: "세 축과 색 영역의 단서를 겹쳐 숨은 고양이를 찾는 3D 논리 퍼즐.",
    tags: ["PUZZLE", "3D LOGIC", "BROWSER GAME"],
    status: "live",
    accent: "acid",
    url: "https://etienne0112.github.io/MicroGame3D/",
    repository: "https://github.com/Etienne0112/MicroGame3D",
  },
];

const plannedSites: WorkspaceSite[] = Array.from({ length: workspaceCapacity - activeSites.length }, (_, offset) => {
  const index = offset + activeSites.length + 1;
  const accents: WorkspaceSite["accent"][] = ["acid", "ink", "red", "blue"];

  return {
    index,
    name: `Reserved Slot ${String(index).padStart(2, "0")}`,
    mark: String(index).padStart(2, "0"),
    description: "다음 작업 공간을 위한 자리. 새 사이트가 생기면 이 카드가 바로가기 카드로 바뀝니다.",
    tags: ["NEXT SITE", "OPEN SLOT"],
    status: "planned",
    accent: accents[offset % accents.length],
  };
});

const workspaceSites = [...activeSites, ...plannedSites];

const directLinks: NetworkLink[] = [
  {
    name: "Main Site",
    mark: "EOW",
    label: "모든 작업 공간의 메인 허브",
    url: mainSiteUrl,
    accent: "acid",
  },
  {
    name: "This Repository",
    mark: "GH",
    label: "MainSite 소스 코드",
    url: mainRepositoryUrl,
    accent: "ink",
  },
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function Home() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("eow-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = savedTheme ? savedTheme === "dark" : prefersDark;
    const frame = window.requestAnimationFrame(() => setIsDark(initialDark));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement !== searchRef.current) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "Escape" && document.activeElement === searchRef.current) {
        setQuery("");
        searchRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const visibleSites = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return workspaceSites.filter((site) => {
      const matchesFilter = filter === "all" || site.status === filter;
      const searchable = [site.name, site.mark, site.description, ...site.tags]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalizedQuery || searchable.includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    window.localStorage.setItem("eow-theme", nextDark ? "dark" : "light");
  };

  return (
    <div className="site-shell">
      <header className="navbar">
        <div className="nav-container">
          <a href="#top" className="brand" aria-label="Everything of my workspace home">
            <span className="brand-mark">EOW.</span>
            <span className="brand-copy">EVERYTHING<br />MY WORKSPACE</span>
          </a>
          <span className="issue-label">SITE DIRECTORY / 2026</span>
          <nav className="nav-actions" aria-label="Directory controls">
            <a className="nav-button desktop-only" href="#directory">VIEW ALL 20 ↘</a>
            <details className="site-network-menu">
              <summary className="nav-button">SITES <span aria-hidden="true">＋</span></summary>
              <div className="site-network-popover">
                <section className="site-network-group" aria-labelledby="other-sites-label">
                  <p className="site-network-heading" id="other-sites-label">OTHER SITES / {pad(activeSites.length)}</p>
                  {activeSites.map((site) => (
                    <a className="site-network-link" href={site.url} target="_blank" rel="noreferrer" key={site.name}>
                      <span className={`site-network-mark site-network-mark--${site.accent}`}>{site.mark}</span>
                      <span className="site-network-copy"><strong>{site.name}</strong><small>{site.description}</small></span>
                      <span className="site-network-arrow" aria-hidden="true">↗</span>
                    </a>
                  ))}
                </section>
                <section className="site-network-group site-network-group--direct" aria-labelledby="direct-links-label">
                  <p className="site-network-heading" id="direct-links-label">DIRECT LINKS / 02</p>
                  {directLinks.map((link) => (
                    <a className="site-network-link" href={link.url} target="_blank" rel="noreferrer" key={link.name}>
                      <span className={`site-network-mark site-network-mark--${link.accent}`}>{link.mark}</span>
                      <span className="site-network-copy"><strong>{link.name}</strong><small>{link.label}</small></span>
                      <span className="site-network-arrow" aria-hidden="true">↗</span>
                    </a>
                  ))}
                </section>
              </div>
            </details>
            <button className="theme-button" type="button" onClick={toggleTheme} aria-label="색상 테마 바꾸기">
              ◐
            </button>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="gateway container" aria-labelledby="hero-title">
          <div className="gateway-meta">
            <span>PERSONAL WEB NETWORK</span>
            <span>{pad(activeSites.length)} CONNECTED · {pad(plannedSites.length)} READY</span>
            <span>SEOUL / 2026</span>
          </div>

          <div className="gateway-stage">
            <div className="gateway-copy">
              <p className="eyebrow"><span className="signal-dot" /> EVERYTHING, ONE FRONT DOOR</p>
              <h1 id="hero-title">MY DIGITAL<br /><em>WORKSPACE,</em><br />ALL IN ONE.</h1>
              <p className="gateway-lead">
                기록도, 공부도, 앞으로 만들 무언가도 여기서 시작합니다.<br />
                흩어진 사이트를 한눈에 보고 바로 건너가는 개인용 메인 허브.
              </p>
              <div className="gateway-actions">
                <a className="primary-button" href="#directory">EXPLORE ALL 20 <span>↓</span></a>
                <a className="ghost-button" href="https://github.com/Etienne0112" target="_blank" rel="noreferrer">GITHUB PROFILE ↗</a>
              </div>
            </div>

            <aside className="switchboard" aria-label="Active workspace sites">
              <div className="switchboard-head">
                <span>QUICK LAUNCH</span>
                <span><i className="signal-dot" /> SYSTEM ONLINE</span>
              </div>
              <div className="hub-visual" aria-hidden="true">
                <span className="orbit orbit-one" />
                <span className="orbit orbit-two" />
                <span className="hub-core">EOW<small>MAIN</small></span>
                <span className="route route-dr">DR</span>
                <span className="route route-sa">SA</span>
                <span className="route route-m3d">M3D</span>
              </div>
              <div className="launch-list">
                {activeSites.map((site) => (
                  <a
                    className={`launch-row launch-row--${site.accent}`}
                    href={site.url}
                    target="_blank"
                    rel="noreferrer"
                    key={site.name}
                  >
                    <span>{pad(site.index)}</span>
                    <strong>{site.name}</strong>
                    <small>{site.mark} / ONLINE</small>
                    <b aria-hidden="true">↗</b>
                  </a>
                ))}
              </div>
            </aside>
          </div>

          <div className="capacity-map" aria-label="20 workspace positions">
            <div className="capacity-label"><span>CAPACITY MAP</span><strong>20</strong></div>
            <div className="capacity-track">
              {workspaceSites.map((site) => (
                site.url ? (
                  <a href={site.url} target="_blank" rel="noreferrer" className={`capacity-node capacity-node--${site.accent}`} key={site.index} aria-label={`${site.name} 열기`}>
                    <span>{pad(site.index)}</span><small>{site.mark}</small>
                  </a>
                ) : (
                  <span className="capacity-node capacity-node--empty" key={site.index} aria-label={`예약 슬롯 ${pad(site.index)}`}>
                    <span>{pad(site.index)}</span><small>—</small>
                  </span>
                )
              ))}
            </div>
            <div className="capacity-summary">
              <span><b>{pad(activeSites.length)}</b> LIVE</span>
              <span><b>{pad(plannedSites.length)}</b> OPEN</span>
            </div>
          </div>
        </section>

        <section className="directory container" id="directory" aria-labelledby="directory-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MASTER INDEX / ALL DESTINATIONS</p>
              <h2 id="directory-title">WORKSPACE DIRECTORY</h2>
            </div>
            <p><strong>{pad(visibleSites.length)}</strong> ENTRIES SHOWN</p>
          </div>

          <div className="directory-toolbar">
            <div className="filter-group" aria-label="사이트 상태 필터">
              {(["all", "live", "planned"] as Filter[]).map((value) => (
                <button
                  type="button"
                  key={value}
                  className={filter === value ? "active" : ""}
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {value === "all" ? `ALL ${workspaceCapacity}` : value === "live" ? `LIVE ${pad(activeSites.length)}` : `PLANNED ${pad(plannedSites.length)}`}
                </button>
              ))}
            </div>
            <label className="search-box">
              <span className="sr-only">사이트 검색</span>
              <input
                ref={searchRef}
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="SEARCH THE INDEX"
                autoComplete="off"
              />
              <kbd>/</kbd>
            </label>
          </div>

          {visibleSites.length > 0 ? (
            <div className="site-grid">
              {visibleSites.map((site) => {
                const content = site.status === "live" ? (
                  <>
                    <div className="card-register"><span>ACTIVE DESTINATION / {pad(site.index)}</span><span>ONLINE</span></div>
                    <div className="card-body">
                      <div className="live-card-top"><span className="site-mark">{site.mark}</span><span className="card-status"><span className="signal-dot" /> LIVE NOW</span></div>
                      <h3>{site.name}</h3>
                      <p>{site.description}</p>
                      <div className="card-tags">{site.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                    </div>
                    <div className="card-footer"><span>ENTER SITE</span><span aria-hidden="true">↗</span></div>
                  </>
                ) : (
                  <>
                    <div className="slot-index">{pad(site.index)}</div>
                    <div className="slot-copy">
                      <span className="empty-dot" />
                      <strong>OPEN POSITION</strong>
                      <small>READY FOR NEXT SITE</small>
                    </div>
                    <span className="slot-plus" aria-hidden="true">＋</span>
                  </>
                );

                return site.url ? (
                  <a
                    className={`site-card site-card--${site.accent} site-card--live`}
                    href={site.url}
                    target="_blank"
                    rel="noreferrer"
                    key={site.index}
                    aria-label={`${site.name} 열기`}
                  >
                    {content}
                  </a>
                ) : (
                  <article className={`site-card site-card--${site.accent} site-card--planned`} key={site.index} aria-label={site.name}>
                    {content}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" role="status">
              <strong>NO MATCHING WORKSPACE.</strong>
              <button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>RESET INDEX</button>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <p><strong>EVERYTHING OF MY WORKSPACE / SITE INDEX</strong><br />One entrance for every place I build.</p>
          <div>
            <a href={mainSiteUrl}>MAIN SITE</a>
            <span> · </span>
            <a href={mainRepositoryUrl} target="_blank" rel="noreferrer">THIS REPOSITORY ↗</a>
            <span> · </span>
            <a href="#top">TOP ↑</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
