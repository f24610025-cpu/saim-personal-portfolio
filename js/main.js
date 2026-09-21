/**
 * Vanilla ES6 JavaScript for the portfolio.
 * No libraries. The contact form works without Formspree.
 */

// Formspree endpoint used after JavaScript validation passes.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/maenonop";

const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const contactForm = document.querySelector("#contact-form");
const skillsSection = document.querySelector("#skills");
const formStatus = document.querySelector("#form-status");

const openMenu = () => {
  siteNav.classList.add("is-open");
  navToggle.setAttribute("aria-expanded", "true");
  navToggle.setAttribute("aria-label", "Close menu");
};

const closeMenu = () => {
  siteNav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Open menu");
};

navToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.contains("is-open");
  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

// Highlight the nav link for the section currently on screen
const sections = document.querySelectorAll("main section[id]");

const setActiveLink = (id) => {
  navLinks.forEach((link) => {
    const isMatch = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isMatch);
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  },
  {
    rootMargin: "-40% 0px -50% 0px",
    threshold: 0,
  }
);

sections.forEach((section) => sectionObserver.observe(section));

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const fillSkillBars = () => {
  const bars = document.querySelectorAll(".progress-bar");
  bars.forEach((bar) => {
    const value = bar.getAttribute("data-progress");
    bar.style.width = `${value}%`;
  });
};

if (skillsSection) {
  if (prefersReducedMotion) {
    fillSkillBars();
  } else {
    const skillsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            fillSkillBars();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    skillsObserver.observe(skillsSection);
  }
}

const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("#email");
const messageInput = document.querySelector("#message");

const setFieldError = (input, message) => {
  const errorEl = document.querySelector(`#${input.id}-error`);
  errorEl.textContent = message;
  input.classList.toggle("is-invalid", Boolean(message));
  input.setAttribute("aria-invalid", message ? "true" : "false");
};

const isValidEmail = (value) => {
  // Simple check: text, @, text, dot, text
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const validateForm = () => {
  let isValid = true;

  const nameValue = nameInput.value.trim();
  const emailValue = emailInput.value.trim();
  const messageValue = messageInput.value.trim();

  if (nameValue.length < 2) {
    setFieldError(nameInput, "Please enter your name (at least 2 characters).");
    isValid = false;
  } else {
    setFieldError(nameInput, "");
  }

  if (!emailValue) {
    setFieldError(emailInput, "Please enter your email address.");
    isValid = false;
  } else if (!isValidEmail(emailValue)) {
    setFieldError(
      emailInput,
      "Please enter a valid email, like name@example.com."
    );
    isValid = false;
  } else {
    setFieldError(emailInput, "");
  }

  if (messageValue.length < 10) {
    setFieldError(
      messageInput,
      "Please write a message of at least 10 characters."
    );
    isValid = false;
  } else {
    setFieldError(messageInput, "");
  }

  return isValid;
};

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  formStatus.textContent = "";
  formStatus.classList.remove("is-success");

  if (!validateForm()) {
    formStatus.textContent = "Please fix the errors above and try again.";
    return;
  }

  // Local success always. fetch runs only if you add a Formspree URL later.
  if (FORMSPREE_ENDPOINT) {
    fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        message: messageInput.value.trim(),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Request failed");
        }
        formStatus.textContent = "Thanks. Your message was sent.";
        formStatus.classList.add("is-success");
        contactForm.reset();
      })
      .catch(() => {
        formStatus.textContent =
          "The message could not be sent online, but your details were valid.";
      });
    return;
  }

  formStatus.textContent =
    "Thanks. Your message looks valid. Email sending is not set up yet.";
  formStatus.classList.add("is-success");
  contactForm.reset();
});
