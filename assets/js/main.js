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
const form = document.querySelector(".lead-form");
const formMessage = document.getElementById("formMessage");

const reviews = [
  {
    avatar: "IK",
    name: "Inder Kapoor",
    count: "3 reviews",
    time: "4 months ago",
    text: "I turned to Bathxpertz to remodel 2 Toilets and Dresser Room at our Apartment in Vipul Belmonte, Golf Course Road, Sector 53 Gurugram. From concept to site supervision, the work got completed on time. The finished product looks more beautiful than projected. Excellent teamwork at Bathxpertz helped realise a long cherished desire to upgrade our humble living to 7 stars."
  },
  {
    avatar: "RS",
    name: "Ritu Sharma",
    count: "7 reviews",
    time: "6 months ago",
    text: "The team handled our master bathroom renovation with real professionalism. Design support, material selection, and installation were all coordinated smoothly. We appreciated the clean execution, regular updates, and the premium final finish."
  },
  {
    avatar: "AM",
    name: "Aman Malhotra",
    count: "5 reviews",
    time: "8 months ago",
    text: "Bathxpertz transformed two washrooms in our home and delivered exactly the modern look we wanted. Their designers understood the space well, the project stayed on schedule, and the overall service experience felt organised from start to finish."
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

if (form && formMessage) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    formMessage.textContent = "Thanks. Our team will contact you shortly.";
    form.reset();
  });
}
