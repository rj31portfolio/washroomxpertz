const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const mobileDrawer = document.getElementById("mobileDrawer");
const drawerClose = document.getElementById("drawerClose");
const siteHeader = document.getElementById("siteHeader");
const reviewPrev = document.getElementById("reviewPrev");
const reviewNext = document.getElementById("reviewNext");
const reviewCard = document.getElementById("reviewCard");
const reviewAvatar = document.getElementById("reviewAvatar");
const reviewName = document.getElementById("reviewName");
const reviewCount = document.getElementById("reviewCount");
const reviewTime = document.getElementById("reviewTime");
const reviewText = document.getElementById("reviewText");
const catalogueTrack = document.getElementById("catalogueTrack");
const cataloguePrev = document.getElementById("cataloguePrev");
const catalogueNext = document.getElementById("catalogueNext");
const catalogueDots = document.getElementById("catalogueDots");
const demoForms = Array.from(document.querySelectorAll("[data-demo-form]"));

const reviews = [
  {
    avatar: "SS",
    name: "Shubham Soni",
    count: "6 reviews",
    time: "1 week ago",
    text: "Washroom Xpertz exceeded my expectations in every aspect. From the initial design consultation to the final installation, their professionalism and commitment to quality were outstanding. The finishing was flawless, and their attention to detail was remarkable. If you're looking for a stylish, durable, and perfectly executed washroom renovation, Washroom Xpertz is the right choice."
  },
  {
    avatar: "SK",
    name: "Sanoj Kumar",
    count: "1 review",
    time: "1 week ago",
    text: "Excellent washroom interior work! The design, tile selection, lighting, and fittings were executed perfectly. The team was professional, completed the project on time, and maintained high-quality standards throughout. The final result exceeded our expectations and gave our washroom a modern, luxurious look. Highly recommended for washroom interior and renovation services."
  },
  {
    avatar: "RK",
    name: "Rahul Khanna",
    count: "4 reviews",
    time: "2 weeks ago",
    text: "We hired Washroom Xpertz for a complete bathroom renovation, and the experience was excellent. Their team guided us through every stage, from design planning to installation. The workmanship, quality of materials, and overall finish were truly impressive. We are extremely happy with the final outcome."
  }
];

let activeReviewIndex = 0;
let reviewTimerId = null;
let activeCatalogueIndex = 0;
let catalogueTimerId = null;

if (siteHeader) {
  const syncHeaderState = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  syncHeaderState();
  window.addEventListener("scroll", syncHeaderState, { passive: true });
}

if (reviewCard && reviewAvatar && reviewName && reviewCount && reviewTime && reviewText) {
  const renderReview = (index) => {
    const review = reviews[index];
    reviewCard.classList.add("is-changing");

    window.setTimeout(() => {
      reviewAvatar.textContent = review.avatar;
      reviewName.textContent = review.name;
      reviewCount.textContent = review.count;
      reviewTime.textContent = review.time;
      reviewText.textContent = review.text;
      reviewCard.classList.remove("is-changing");
    }, 140);
  };

  const startReviewAutoplay = () => {
    if (reviewTimerId) {
      window.clearInterval(reviewTimerId);
    }

    reviewTimerId = window.setInterval(() => {
      activeReviewIndex = (activeReviewIndex + 1) % reviews.length;
      renderReview(activeReviewIndex);
    }, 4500);
  };

  const goToReview = (direction) => {
    activeReviewIndex = (activeReviewIndex + direction + reviews.length) % reviews.length;
    renderReview(activeReviewIndex);
    startReviewAutoplay();
  };

  renderReview(activeReviewIndex);
  startReviewAutoplay();

  if (reviewPrev) {
    reviewPrev.addEventListener("click", () => {
      goToReview(-1);
    });
  }

  if (reviewNext) {
    reviewNext.addEventListener("click", () => {
      goToReview(1);
    });
  }
}

if (catalogueTrack) {
  const catalogueSlides = Array.from(catalogueTrack.children);

  const stopCatalogueAutoplay = () => {
    if (catalogueTimerId) {
      window.clearInterval(catalogueTimerId);
      catalogueTimerId = null;
    }
  };

  const renderCatalogueDots = () => {
    if (!catalogueDots) {
      return;
    }

    catalogueDots.innerHTML = "";

    catalogueSlides.forEach((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = `catalogue-dot${index === activeCatalogueIndex ? " is-active" : ""}`;
      dot.setAttribute("aria-label", `Go to catalogue slide ${index + 1}`);
      dot.addEventListener("click", () => {
        activeCatalogueIndex = index;
        updateCatalogueSlider();
        startCatalogueAutoplay();
      });
      catalogueDots.appendChild(dot);
    });
  };

  const updateCatalogueSlider = () => {
    const slideWidth = catalogueSlides[0] ? catalogueSlides[0].getBoundingClientRect().width : 0;
    const offset = activeCatalogueIndex * slideWidth;
    catalogueTrack.style.transform = `translateX(-${offset}px)`;

    if (cataloguePrev) {
      cataloguePrev.disabled = catalogueSlides.length <= 1;
    }

    if (catalogueNext) {
      catalogueNext.disabled = catalogueSlides.length <= 1;
    }

    if (catalogueDots) {
      Array.from(catalogueDots.children).forEach((dot, index) => {
        dot.classList.toggle("is-active", index === activeCatalogueIndex);
      });
    }
  };

  const startCatalogueAutoplay = () => {
    stopCatalogueAutoplay();

    if (catalogueSlides.length <= 1) {
      return;
    }

    catalogueTimerId = window.setInterval(() => {
      activeCatalogueIndex = (activeCatalogueIndex + 1) % catalogueSlides.length;
      updateCatalogueSlider();
    }, 4500);
  };

  const moveCatalogueSlider = (direction) => {
    activeCatalogueIndex = (activeCatalogueIndex + direction + catalogueSlides.length) % catalogueSlides.length;
    updateCatalogueSlider();
    startCatalogueAutoplay();
  };

  renderCatalogueDots();
  updateCatalogueSlider();
  startCatalogueAutoplay();

  if (cataloguePrev) {
    cataloguePrev.addEventListener("click", () => {
      moveCatalogueSlider(-1);
    });
  }

  if (catalogueNext) {
    catalogueNext.addEventListener("click", () => {
      moveCatalogueSlider(1);
    });
  }

  catalogueTrack.addEventListener("mouseenter", stopCatalogueAutoplay);
  catalogueTrack.addEventListener("mouseleave", startCatalogueAutoplay);

  window.addEventListener("resize", updateCatalogueSlider, { passive: true });
}

if (menuToggle && mobileDrawer) {
  const setDrawerState = (isOpen) => {
    mobileDrawer.classList.toggle("is-open", isOpen);
    mobileDrawer.setAttribute("aria-hidden", String(!isOpen));
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("drawer-open", isOpen);
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = !mobileDrawer.classList.contains("is-open");
    setDrawerState(isOpen);
  });

  if (drawerClose) {
    drawerClose.addEventListener("click", () => {
      setDrawerState(false);
    });
  }

  mobileDrawer.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setDrawerState(false);
    });
  });
}

if (demoForms.length) {
  demoForms.forEach((form) => {
    const formMessage = form.querySelector(".form-note") || document.getElementById(form.getAttribute("aria-describedby") || "");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      if (formMessage) {
        formMessage.textContent = "Thanks. Our team will contact you shortly.";
      }

      form.reset();
    });
  });
}
