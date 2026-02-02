function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || "";
}

function prettyDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value || "—";
  return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

const summary = document.querySelector("#formSummary");

const data = [
  { label: "First Name", value: getParam("fname") },
  { label: "Last Name", value: getParam("lname") },
  { label: "Email", value: getParam("email") },
  { label: "Mobile Phone", value: getParam("phone") },
  { label: "Business / Organization", value: getParam("org") },
  { label: "Submitted At", value: prettyDate(getParam("timestamp")) }
];

if (summary) {
  summary.innerHTML = "";
  data.forEach(item => {
    const dt = document.createElement("dt");
    dt.textContent = item.label;

    const dd = document.createElement("dd");
    dd.textContent = item.value || "—";

    summary.appendChild(dt);
    summary.appendChild(dd);
  });
}
