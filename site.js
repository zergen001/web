const languageKey = "zg-support:" + new URL(".", document.currentScript.src).pathname + ":language";

function preferredLanguage() {
  try {
    const saved = localStorage.getItem(languageKey);
    if (saved === "en" || saved === "zh-CN") return saved;
  } catch {
    // The browser may restrict local storage.
  }
  return navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}

function displayAppPolicies() {
  const container = document.querySelector("[data-app-policies]");
  if (!container) return;
  for (const app of supportSite.appPolicies) {
    const section = document.createElement("section");
    const heading = document.createElement("h2");
    heading.textContent = app.name;
    section.append(heading);
    for (const [language, content] of [["en", app.en], ["zh-CN", app.zh]]) {
      const paragraph = document.createElement("p");
      paragraph.lang = language;
      paragraph.textContent = content;
      section.append(paragraph);
    }
    container.append(section);
  }
}

function setLanguage(language) {
  const chinese = language === "zh-CN";
  document.documentElement.lang = language;
  document.title = (chinese ? document.body.dataset.titleZh : document.body.dataset.titleEn)
    + " · " + supportSite.developerName;
  document.querySelector("nav").setAttribute("aria-label", chinese ? "主导航" : "Main navigation");
  for (const button of document.querySelectorAll("[data-language]")) {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  }
  const date = document.querySelector("[data-policy-date]");
  if (date) {
    date.dateTime = supportSite[date.dataset.policyDate];
    date.textContent = new Intl.DateTimeFormat(language, {dateStyle: "long", timeZone: "UTC"})
      .format(new Date(date.dateTime + "T00:00:00Z"));
  }
  const contact = document.querySelector("[data-contact]");
  if (!contact) return;
  const email = supportSite.supportEmail.trim();
  const missing = document.querySelector("[data-missing]");
  missing.hidden = Boolean(email);
  contact.hidden = !email;
  if (!email) return;

  const subject = chinese ? "App 使用反馈" : "App feedback";
  const body = chinese
    ? "App 名称：\nApp 版本：\nmacOS 版本：\n\n问题或建议：\n"
    : "App name:\nApp version:\nmacOS version:\n\nProblem or suggestion:\n";
  contact.querySelector("[data-compose]").href = "mailto:" + email
    + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  const address = contact.querySelector("[data-email]");
  address.textContent = email;
  address.href = "mailto:" + email;
}

for (const brand of document.querySelectorAll("[data-brand]")) {
  brand.textContent = supportSite.developerName;
}
displayAppPolicies();
setLanguage(preferredLanguage());
document.querySelector(".languages").hidden = false;
for (const button of document.querySelectorAll("[data-language]")) {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.language);
    try {
      localStorage.setItem(languageKey, button.dataset.language);
    } catch {
      // The selection still applies to the current page.
    }
  });
}
