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
const modalOpeners = Array.from(document.querySelectorAll("[data-modal-open]"));
const modalClosers = Array.from(document.querySelectorAll("[data-modal-close]"));
const careerRoleField = document.getElementById("careerRoleField");

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
  let lastScrollY = window.scrollY;

  const syncHeaderState = () => {
    const currentScrollY = window.scrollY;
    const isScrolled = currentScrollY > 24;
    const isScrollingDown = currentScrollY > lastScrollY && currentScrollY > 120;

    siteHeader.classList.toggle("is-scrolled", isScrolled);
    siteHeader.classList.toggle("is-hidden", isScrollingDown);

    if (currentScrollY <= 24) {
      siteHeader.classList.remove("is-hidden");
    }

    lastScrollY = currentScrollY;
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

const accordionRoots = Array.from(document.querySelectorAll("[data-simple-accordion]"));

if (accordionRoots.length) {
  accordionRoots.forEach((root) => {
    const items = Array.from(root.querySelectorAll("[data-accordion-item]"));

    const closeItem = (item) => {
      item.classList.remove("is-open");
      const trigger = item.querySelector("[data-accordion-trigger]");
      if (trigger) {
        trigger.setAttribute("aria-expanded", "false");
      }
    };

    const openItem = (item) => {
      items.forEach((entry) => {
        if (entry !== item) {
          closeItem(entry);
        }
      });

      item.classList.add("is-open");
      const trigger = item.querySelector("[data-accordion-trigger]");
      if (trigger) {
        trigger.setAttribute("aria-expanded", "true");
      }
    };

    items.forEach((item, index) => {
      const trigger = item.querySelector("[data-accordion-trigger]");

      if (!trigger) {
        return;
      }

      if (item.classList.contains("is-open")) {
        openItem(item);
      } else {
        closeItem(item);
      }

      trigger.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");

        if (isOpen) {
          closeItem(item);
          return;
        }

        openItem(item);
      });

      if (index === 0 && !items.some((entry) => entry.classList.contains("is-open"))) {
        openItem(item);
      }
    });
  });
}

const catalogueBrowser = document.querySelector("[data-catalogue-browser]");

if (catalogueBrowser) {
  const filterButtons = Array.from(catalogueBrowser.querySelectorAll("[data-catalogue-filter]"));
  const cards = Array.from(catalogueBrowser.querySelectorAll("[data-catalogue-card]"));
  const seeMoreButton = catalogueBrowser.querySelector("[data-catalogue-more]");
  const emptyState = catalogueBrowser.querySelector(".catalogue-empty-state");
  const visibleCount = Number(catalogueBrowser.getAttribute("data-visible-count")) || 4;
  let activeFilter = "all";
  let expanded = false;

  const renderCatalogueCards = () => {
    const matchingCards = cards.filter((card) => {
      const category = card.getAttribute("data-catalogue-card");
      return activeFilter === "all" || category === activeFilter;
    });

    cards.forEach((card) => {
      card.hidden = true;
    });

    matchingCards.forEach((card, index) => {
      card.hidden = !expanded && index >= visibleCount;
    });

    if (emptyState) {
      emptyState.hidden = matchingCards.length !== 0;
    }

    if (seeMoreButton) {
      if (matchingCards.length <= visibleCount) {
        seeMoreButton.hidden = true;
      } else {
        seeMoreButton.hidden = false;
        seeMoreButton.textContent = expanded ? "Show Less" : "See More";
      }
    }
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = button.getAttribute("data-catalogue-filter") || "all";
      expanded = false;

      filterButtons.forEach((entry) => {
        const isActive = entry === button;
        entry.classList.toggle("is-active", isActive);
        entry.setAttribute("aria-pressed", String(isActive));
      });

      renderCatalogueCards();
    });
  });

  if (seeMoreButton) {
    seeMoreButton.addEventListener("click", () => {
      expanded = !expanded;
      renderCatalogueCards();
    });
  }

  renderCatalogueCards();
}

if (modalOpeners.length || modalClosers.length) {
  const setModalState = (modal, isOpen) => {
    if (!modal) {
      return;
    }

    modal.hidden = !isOpen;
    modal.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("modal-open", isOpen);
  };

  modalOpeners.forEach((opener) => {
    opener.addEventListener("click", () => {
      const modal = document.getElementById(opener.getAttribute("data-modal-open"));
      const role = opener.getAttribute("data-role");

      if (careerRoleField && role) {
        careerRoleField.value = role;
      }

      setModalState(modal, true);
    });
  });

  modalClosers.forEach((closer) => {
    closer.addEventListener("click", () => {
      const modal = document.getElementById(closer.getAttribute("data-modal-close"));
      setModalState(modal, false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    const openModal = document.querySelector(".career-modal:not([hidden])");
    if (openModal) {
      setModalState(openModal, false);
    }
  });
}
