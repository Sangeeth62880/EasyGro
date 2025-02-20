// Theme toggle functionality
const themeToggle = document.getElementById("themeToggle")
const body = document.body

themeToggle.addEventListener("click", () => {
  body.setAttribute("data-theme", body.getAttribute("data-theme") === "dark" ? "light" : "dark")
})

// Current time display
function updateTime() {
  const currentTime = document.getElementById("currentTime")
  const now = new Date()
  currentTime.textContent = now.toISOString().slice(0, 19).replace("T", " ")
}

setInterval(updateTime, 1000)
updateTime()

// Mobile navigation toggle
const navToggle = document.querySelector(".nav__toggle")
const navList = document.querySelector(".nav__list")

navToggle.addEventListener("click", () => {
  navToggle.classList.toggle("active")
  navList.classList.toggle("active")
})

// User menu dropdown
const userMenuTrigger = document.querySelector(".user-menu__trigger")
const userMenuDropdown = document.querySelector(".user-menu__dropdown")

userMenuTrigger.addEventListener("click", (e) => {
  e.stopPropagation()
  userMenuDropdown.classList.toggle("active")
})

document.addEventListener("click", () => {
  userMenuDropdown.classList.remove("active")
})

// Tabs functionality
const tabTriggers = document.querySelectorAll(".tabs__trigger")
const tabPanels = document.querySelectorAll(".tabs__panel")

tabTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const tabId = trigger.getAttribute("data-tab")

    tabTriggers.forEach((t) => t.classList.remove("active"))
    tabPanels.forEach((p) => p.classList.remove("active"))

    trigger.classList.add("active")
    document.querySelector(`[data-tab-content="${tabId}"]`).classList.add("active")
  })
})

// Accordion functionality
const accordionTriggers = document.querySelectorAll(".accordion__trigger")

accordionTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const parent = trigger.parentElement
    const isActive = parent.classList.contains("active")

    // Close all accordion items
    document.querySelectorAll(".accordion__item").forEach((item) => {
      item.classList.remove("active")
    })

    // Open clicked item if it wasn't active
    if (!isActive) {
      parent.classList.add("active")
    }
  })
})

// Form validation
const profileForm = document.getElementById("profileForm")
const formInputs = profileForm.querySelectorAll("input, textarea")

function validateInput(input) {
  const parent = input.parentElement

  if (input.required && !input.value.trim()) {
    parent.classList.add("error")
    parent.querySelector(".form__error").textContent = "This field is required"
    return false
  }

  if (input.type === "email" && input.value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(input.value)) {
      parent.classList.add("error")
      parent.querySelector(".form__error").textContent = "Please enter a valid email address"
      return false
    }
  }

  if (input.type === "tel" && input.value) {
    const phoneRegex = /^$$\d{3}$$ \d{3}-\d{4}$/
    if (!phoneRegex.test(input.value)) {
      parent.classList.add("error")
      parent.querySelector(".form__error").textContent = "Please enter a valid phone number: (123) 456-7890"
      return false
    }
  }

  parent.classList.remove("error")
  return true
}

formInputs.forEach((input) => {
  input.addEventListener("blur", () => validateInput(input))
  input.addEventListener("input", () => {
    if (input.parentElement.classList.contains("error")) {
      validateInput(input)
    }
  })
})

profileForm.addEventListener("submit", (e) => {
  e.preventDefault()
  let isValid = true

  formInputs.forEach((input) => {
    if (!validateInput(input)) {
      isValid = false
    }
  })

  if (isValid) {
    // Handle form submission
    console.log("Form submitted successfully")
  }
})

// Avatar upload preview
const avatarInput = document.getElementById("avatarInput")
const avatarPreview = document.getElementById("avatarPreview")

avatarInput.addEventListener("change", (e) => {
  const file = e.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      avatarPreview.src = e.target.result
    }
    reader.readAsDataURL(file)
  }
})

