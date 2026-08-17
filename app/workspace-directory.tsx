"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import siteNetwork from "../public/site-network.json";
import { copy, htmlLanguages, languageLabels, localePath, locales, type Locale } from "./i18n";

type Filter = "all" | "live" | "planned";

type WorkspaceSite = {
  id: string;
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

const workspaceCapacity = 20;
// 서브사이트의 subsite-shell.js와 같은 키를 씁니다.
const themeStorageKey = "desertrose.theme";
const mainSite = siteNetwork.sites.find((site) => site.id === siteNetwork.mainSiteId);

if (!mainSite) throw new Error("The main site is missing from site-network.json.");

const mainRepositoryUrl = mainSite.repository;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function WorkspaceDirectory({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const activeSites = useMemo<WorkspaceSite[]>(() => siteNetwork.sites
    .filter((site) => site.id !== siteNetwork.mainSiteId)
    .map((site, offset) => ({
      id: site.id,
      index: offset + 1,
      name: site.name,
      mark: site.mark,
      description: t.siteDescriptions[site.id] || site.description,
      tags: site.tags,
      status: "live",
      accent: site.tone as WorkspaceSite["accent"],
      url: site.url,
      repository: site.repository,
    })), [t]);

  const plannedSites = useMemo<WorkspaceSite[]>(() => Array.from(
    { length: workspaceCapacity - activeSites.length },
    (_, offset) => {
      const index = offset + activeSites.length + 1;
      const accents: WorkspaceSite["accent"][] = ["acid", "ink", "red", "blue"];
      return {
        id: `reserved-${index}`,
        index,
        name: `${t.reservedSlot} ${pad(index)}`,
        mark: pad(index),
        description: t.reservedDescription,
        tags: [t.nextSite, t.openSlot],
        status: "planned",
        accent: accents[offset % accents.length],
      };
    },
  ), [activeSites.length, t]);

  const workspaceSites = useMemo(() => [...activeSites, ...plannedSites], [activeSites, plannedSites]);
  const directLinks = useMemo<NetworkLink[]>(() => [
    {
      name: t.mainSite,
      mark: "EOW",
      label: t.mainSiteLabel,
      url: localePath(locale),
      accent: mainSite.tone as NetworkLink["accent"],
    },
    {
      name: t.repository,
      mark: "GH",
      label: t.repositoryLabel,
      url: mainRepositoryUrl,
      accent: "ink",
    },
  ], [locale, t]);

  useEffect(() => {
    document.documentElement.lang = htmlLanguages[locale];
  }, [locale]);

  useEffect(() => {
    // 서브사이트와 같은 출처를 쓰므로, 같은 키를 읽어 선택한 테마가 사이트 사이에서 이어집니다.
    const savedTheme = window.localStorage.getItem(themeStorageKey);
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
    const normalizedQuery = query.trim().toLocaleLowerCase(htmlLanguages[locale]);
    return workspaceSites.filter((site) => {
      const matchesFilter = filter === "all" || site.status === filter;
      const searchable = [site.name, site.mark, site.description, ...site.tags].join(" ").toLocaleLowerCase(htmlLanguages[locale]);
      return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [filter, locale, query, workspaceSites]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    window.localStorage.setItem(themeStorageKey, nextDark ? "dark" : "light");
  };

  return (
    <div className="site-shell">
      <header className="navbar">
        <div className="nav-container">
          <a href="#top" className="nav-brand" aria-label={t.brandAria}>
            <span className="brand-mark">EOW.</span>
            <span className="brand-copy">EVERYTHING<br />MY WORKSPACE</span>
          </a>
          <span className="issue-label">{t.issue}</span>
          {/* 컨트롤 순서는 서브사이트와 같습니다: SITES → 사이트 고유 동작 → LANGUAGE → THEME */}
          <nav className="nav-actions" aria-label={t.issue}>
            <details className="site-network-menu">
              <summary className="nav-button">{t.sites} <span aria-hidden="true">＋</span></summary>
              <div className="site-network-popover">
                <section className="site-network-group" aria-labelledby="other-sites-label">
                  <p className="site-network-heading" id="other-sites-label">{t.otherSites} / {pad(activeSites.length)}</p>
                  {activeSites.map((site) => (
                    <a className="site-network-link" href={site.url} target="_blank" rel="noreferrer" key={site.name}>
                      <span className={`site-network-mark site-network-mark--${site.accent}`}>{site.mark}</span>
                      <span className="site-network-copy"><strong>{site.name}</strong><small>{site.description}</small></span>
                      <span className="site-network-arrow" aria-hidden="true">↗</span>
                    </a>
                  ))}
                </section>
                <section className="site-network-group site-network-group--direct" aria-labelledby="direct-links-label">
                  <p className="site-network-heading" id="direct-links-label">{t.directLinks} / 02</p>
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
            <a className="nav-button desktop-only" href="#directory">{t.viewAll}</a>
            <details className="site-network-menu language-menu">
              <summary className="nav-button">{languageLabels[locale]} <span aria-hidden="true">＋</span></summary>
              <div className="site-network-popover language-popover">
                <section className="site-network-group" aria-labelledby="languages-label">
                  <p className="site-network-heading" id="languages-label">{t.languages} / {pad(locales.length)}</p>
                  <div className="language-grid">
                    {locales.map((code) => (
                      <a className={code === locale ? "active" : ""} href={localePath(code)} hrefLang={htmlLanguages[code]} key={code}>
                        {languageLabels[code]}
                      </a>
                    ))}
                  </div>
                </section>
              </div>
            </details>
            <button className="icon-button" type="button" onClick={toggleTheme} aria-label={t.themeAria}>{isDark ? "◑" : "◒"}</button>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="gateway container" aria-labelledby="hero-title">
          <div className="gateway-meta">
            <span>{t.network}</span>
            <span>{pad(activeSites.length)} {t.connected} · {pad(plannedSites.length)} {t.ready}</span>
            <span>SEOUL / 2026</span>
          </div>

          <div className="gateway-stage">
            <div className="gateway-copy">
              <p className="eyebrow"><span className="signal-dot" /> {t.eyebrow}</p>
              <h1 id="hero-title">{t.heroTitle[0]}<br /><em>{t.heroTitle[1]}</em><br />{t.heroTitle[2]}</h1>
              <p className="gateway-lead">{t.lead[0]}<br />{t.lead[1]}</p>
              <div className="gateway-actions">
                <a className="primary-button" href="#directory">{t.explore} <span>↓</span></a>
                <a className="ghost-button" href="https://github.com/Etienne0112" target="_blank" rel="noreferrer">{t.github}</a>
              </div>
            </div>

            <aside className="switchboard" aria-label={t.quickLaunch}>
              <div className="switchboard-head"><span>{t.quickLaunch}</span><span><i className="signal-dot" /> {t.systemOnline}</span></div>
              <div className="hub-visual" aria-hidden="true">
                <span className="orbit orbit-one" /><span className="orbit orbit-two" />
                <span className="hub-core">EOW<small>MAIN</small></span>
                {activeSites.map((site) => <span className={`route route-${site.accent} route-${site.index}`} key={site.name}>{site.mark}</span>)}
              </div>
              <div className="launch-list">
                {activeSites.map((site) => (
                  <a className={`launch-row launch-row--${site.accent}`} href={site.url} target="_blank" rel="noreferrer" key={site.name}>
                    <span>{pad(site.index)}</span><strong>{site.name}</strong><small>{site.mark} / {t.online}</small><b aria-hidden="true">↗</b>
                  </a>
                ))}
              </div>
            </aside>
          </div>

          <div className="capacity-map" aria-label={`${workspaceCapacity} ${t.capacityMap}`}>
            <div className="capacity-label"><span>{t.capacityMap}</span><strong>20</strong></div>
            <div className="capacity-track">
              {workspaceSites.map((site) => site.url ? (
                <a href={site.url} target="_blank" rel="noreferrer" className={`capacity-node capacity-node--${site.accent}`} key={site.index} aria-label={`${site.name} ${t.openSite}`}>
                  <span>{pad(site.index)}</span><small>{site.mark}</small>
                </a>
              ) : (
                <span className="capacity-node capacity-node--empty" key={site.index} aria-label={`${t.reservedAria} ${pad(site.index)}`}>
                  <span>{pad(site.index)}</span><small>—</small>
                </span>
              ))}
            </div>
            <div className="capacity-summary"><span><b>{pad(activeSites.length)}</b> {t.live}</span><span><b>{pad(plannedSites.length)}</b> {t.open}</span></div>
          </div>
        </section>

        <section className="directory container" id="directory" aria-labelledby="directory-title">
          <div className="section-heading">
            <div><p className="eyebrow">{t.masterIndex}</p><h2 id="directory-title">{t.directory}</h2></div>
            <p><strong>{pad(visibleSites.length)}</strong> {t.entriesShown}</p>
          </div>
          <div className="directory-toolbar">
            <div className="filter-group" aria-label={t.filterAria}>
              {(["all", "live", "planned"] as Filter[]).map((value) => (
                <button type="button" key={value} className={filter === value ? "active" : ""} aria-pressed={filter === value} onClick={() => setFilter(value)}>
                  {value === "all" ? `${t.all} ${workspaceCapacity}` : value === "live" ? `${t.live} ${pad(activeSites.length)}` : `${t.planned} ${pad(plannedSites.length)}`}
                </button>
              ))}
            </div>
            <label className="search-box"><span className="sr-only">{t.searchLabel}</span><input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} autoComplete="off" /><kbd>/</kbd></label>
          </div>

          {visibleSites.length > 0 ? (
            <div className="site-grid">
              {visibleSites.map((site) => {
                const content = site.status === "live" ? (
                  <>
                    <div className="card-register"><span>{t.activeDestination} / {pad(site.index)}</span><span>{t.online}</span></div>
                    <div className="card-body">
                      <div className="live-card-top"><span className="site-mark">{site.mark}</span><span className="card-status"><span className="signal-dot" /> {t.liveNow}</span></div>
                      <h3>{site.name}</h3><p>{site.description}</p>
                      <div className="card-tags">{site.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                    </div>
                    <div className="card-footer"><span>{t.enterSite}</span><span aria-hidden="true">↗</span></div>
                  </>
                ) : (
                  <><div className="slot-index">{pad(site.index)}</div><div className="slot-copy"><span className="empty-dot" /><strong>{t.openPosition}</strong><small>{t.readyForNext}</small></div><span className="slot-plus" aria-hidden="true">＋</span></>
                );
                return site.url ? (
                  <a className={`site-card site-card--${site.accent} site-card--live`} href={site.url} target="_blank" rel="noreferrer" key={site.index} aria-label={`${site.name} ${t.openSite}`}>{content}</a>
                ) : (
                  <article className={`site-card site-card--${site.accent} site-card--planned`} key={site.index} aria-label={site.name}>{content}</article>
                );
              })}
            </div>
          ) : (
            <div className="empty-state" role="status"><strong>{t.noMatch}</strong><button type="button" onClick={() => { setQuery(""); setFilter("all"); }}>{t.reset}</button></div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <p><strong>EVERYTHING OF MY WORKSPACE / SITE INDEX</strong><br />{t.footerTagline}</p>
          <div><a href={localePath(locale)}>{t.mainSite}</a><span> · </span><a href={mainRepositoryUrl} target="_blank" rel="noreferrer">{t.repository} ↗</a><span> · </span><a href="#top">{t.top}</a></div>
        </div>
      </footer>
    </div>
  );
}
