/* =========================
   Responsive Menu
   ========================= */
const menuBtn = document.querySelector("#menuBtn");
const primaryNav = document.querySelector("#primaryNav");

menuBtn.addEventListener("click", () => {
  const open = primaryNav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});

/* =========================
   Footer Dates
   ========================= */
document.querySelector("#currentyear").textContent = new Date().getFullYear();
document.querySelector("#lastModified").textContent = document.lastModified;

/* =========================
   Course List Array
   ========================= */
const courses = [
  { subject: "CSE", number: 110, title: "Introduction to Programming", credits: 2, completed: true },
  { subject: "WDD", number: 130, title: "Web Fundamentals", credits: 2, completed: true },
  { subject: "CSE", number: 111, title: "Programming with Functions", credits: 2, completed: true },
  { subject: "CSE", number: 210, title: "Programming with Classes", credits: 2, completed: true },
  { subject: "WDD", number: 131, title: "Dynamic Web Fundamentals", credits: 2, completed: true },
  { subject: "WDD", number: 231, title: "Frontend Web Development I", credits: 2, completed: true }
];

/* =========================
   DOM Elements
   ========================= */
const courseList = document.querySelector("#courseList");
const creditTotal = document.querySelector("#creditTotal");
const filterButtons = document.querySelectorAll(".course-filters button");

/* =========================
   Render Courses
   ========================= */
function displayCourses(courseArray) {
  courseList.innerHTML = "";

  courseArray.forEach(course => {
    const li = document.createElement("li");
    li.textContent = `${course.subject} ${course.number}`;
    li.classList.add("course-card");

    if (course.completed) {
      li.classList.add("completed");
    }

    courseList.appendChild(li);
  });

  updateCredits(courseArray);
}

/* =========================
   Credits (reduce)
   ========================= */
function updateCredits(courseArray) {
  const total = courseArray.reduce((sum, course) => sum + course.credits, 0);
  creditTotal.textContent = total;
}

/* =========================
   Filter Courses (filter)
   ========================= */
function filterCourses(type) {
  if (type === "all") {
    displayCourses(courses);
    return;
  }

  const filtered = courses.filter(course => course.subject === type.toUpperCase());
  displayCourses(filtered);
}

/* =========================
   Button Events
   ========================= */
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    filterCourses(button.dataset.filter);
  });
});

/* =========================
   Initial Load
   ========================= */
displayCourses(courses);
