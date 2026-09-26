/* ============================================================
   Twin Cities Animal Rescue — script.js
   Interactive feature: Volunteer Role Matcher
   Validation: name, email, experience length
   Storage: localStorage (tcar_volunteer_prefs)
   ============================================================ */

/* ---------- Data: two arrays of objects ---------- */

// Array #1 — volunteer roles
const volunteerRoles = [
    {
        name: "Dog Walker",
        description: "Provide exercise and socialization for our resident dogs on weekday mornings.",
        availability: "weekdays",
        comfort: "high",
        link: "contact.html"
    },
    {
        name: "Cat Care Assistant",
        description: "Help feed, clean, and play with our feline residents on weekday or evening shifts.",
        availability: "weekdays",
        comfort: "high",
        link: "contact.html"
    },
    {
        name: "Event Helper",
        description: "Assist at adoption events, fundraisers, and community outreach on weekends.",
        availability: "weekends",
        comfort: "medium",
        link: "contact.html"
    },
    {
        name: "Transport Driver",
        description: "Help move animals between shelters, vet appointments, and foster homes — flexible hours.",
        availability: "flexible",
        comfort: "medium",
        link: "contact.html"
    },
    {
        name: "Foster Support Volunteer",
        description: "Check in with foster families, deliver supplies, and provide phone support — low animal contact.",
        availability: "evenings",
        comfort: "low",
        link: "contact.html"
    }
];

// Array #2 — validation rules
const validationRules = [
    {
        fieldId: "name",
        check: (value) => value.trim().length > 0,
        message: "Please enter your full name."
    },
    {
        fieldId: "email",
        check: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()),
        message: "Please enter a valid email address (e.g., name@example.com)."
    },
    {
        fieldId: "experience",
        check: (value) => value.trim().length >= 15,
        message: "Please tell us at least a little about your experience (15+ characters)."
    }
];

const STORAGE_KEY = "tcar_volunteer_prefs";

/* ---------- Feature: Volunteer Role Matcher ---------- */

function matchVolunteerRole(availability, comfort) {
    // First try exact match, then fall back to flexible availability
    return volunteerRoles.find(
        (role) => role.availability === availability && role.comfort === comfort
    ) || volunteerRoles.find((role) => role.availability === "flexible")
      || volunteerRoles[0];
}

function renderMatch(role) {
    const resultBox = document.getElementById("matchResult");
    if (!resultBox) return;

    resultBox.innerHTML = `
        <h3>Your Recommended Role: ${role.name}</h3>
        <p>${role.description}</p>
        <a href="${role.link}" class="cta-link">Go to Interest Form →</a>
    `;
    resultBox.hidden = false;
}

function savePreferences(prefs) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            ...prefs,
            savedAt: new Date().toISOString()
        }));
    } catch (err) {
        console.warn("Could not save preferences:", err);
    }
}

function loadPreferences() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (err) {
        console.warn("Could not load preferences:", err);
        return null;
    }
}

function handleMatchClick() {
    const availability = document.getElementById("availability").value;
    const comfort = document.getElementById("comfort").value;

    if (!availability || !comfort) {
        const resultBox = document.getElementById("matchResult");
        if (resultBox) {
            resultBox.innerHTML = "<p>Please select both availability and comfort level.</p>";
            resultBox.hidden = false;
        }
        return;
    }

    const role = matchVolunteerRole(availability, comfort);
    renderMatch(role);
    savePreferences({ availability, comfort });
}

function restoreVolunteerFormState() {
    const saved = loadPreferences();
    if (!saved) return;

    const availField = document.getElementById("availability");
    const comfortField = document.getElementById("comfort");

    if (availField && saved.availability) availField.value = saved.availability;
    if (comfortField && saved.comfort) comfortField.value = saved.comfort;

    // Auto-show the match if both were saved
    if (availField?.value && comfortField?.value) {
        const role = matchVolunteerRole(availField.value, comfortField.value);
        renderMatch(role);
    }
}

/* ---------- Validation ---------- */

function showError(fieldId, message) {
    const errorSpan = document.getElementById(`${fieldId}-error`);
    const field = document.getElementById(fieldId);
    if (errorSpan) errorSpan.textContent = message;
    if (field) field.setAttribute("aria-invalid", "true");
}

function clearError(fieldId) {
    const errorSpan = document.getElementById(`${fieldId}-error`);
    const field = document.getElementById(fieldId);
    if (errorSpan) errorSpan.textContent = "";
    if (field) field.removeAttribute("aria-invalid");
}

function validateField(rule) {
    const field = document.getElementById(rule.fieldId);
    if (!field) return true;

    if (!rule.check(field.value)) {
        showError(rule.fieldId, rule.message);
        return false;
    }
    clearError(rule.fieldId);
    return true;
}

function validateForm(event) {
    let isValid = true;
    validationRules.forEach((rule) => {
        if (!validateField(rule)) isValid = false;
    });

    if (!isValid) {
        event.preventDefault();
        // Focus the first invalid field
        const firstInvalid = validationRules.find(
            (rule) => document.getElementById(rule.fieldId)?.getAttribute("aria-invalid")
        );
        if (firstInvalid) document.getElementById(firstInvalid.fieldId)?.focus();
    }
    return isValid;
}

function attachValidationListeners() {
    validationRules.forEach((rule) => {
        const field = document.getElementById(rule.fieldId);
        if (!field) return;
        field.addEventListener("blur", () => validateField(rule));
        field.addEventListener("input", () => {
            if (field.getAttribute("aria-invalid") === "true") validateField(rule);
        });
    });
}

/* ---------- Init ---------- */

document.addEventListener("DOMContentLoaded", () => {
    // Services page: matcher
    const matchBtn = document.getElementById("matchBtn");
    if (matchBtn) {
        restoreVolunteerFormState();
        matchBtn.addEventListener("click", handleMatchClick);
    }

    // Contact page: validation
    const form = document.querySelector("form");
    if (form) {
        attachValidationListeners();
        form.addEventListener("submit", validateForm);
    }
});