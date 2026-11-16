/**
 * script.js - External JavaScript for DYPCOE Smart College Website Portal
 * Web Technology CCE-5
 * D. Y. Patil College of Engineering, Akurdi, Pune
 */

// Run scripts once the DOM document structure is fully loaded
document.addEventListener('DOMContentLoaded', function () {

  // ================================================================
  // 1 & 2. Single Page Application (SPA) Hash Routing & Navigation
  // ================================================================
  // The portal operates as a Single Page Application (SPA). Instead
  // of loading separate HTML pages for each section, all content lives
  // in index.html and we navigate between sections using URL hashes
  // (#home, #about, #departments, #courses, #faculty, #notices,
  // #admissions, #enquiry).
  // ================================================================

  // ================================================================
  // 1 & 2. Single Page Application (SPA) Page-Based Routing & Navigation
  // ================================================================
  // The portal operates as a page-view Single Page Application (SPA).
  // Instead of scrolling down through all sections on one long page,
  // only the active view is displayed (.page-view.active) while all
  // other views are hidden using CSS (display: none).
  //
  // Supported Routes:
  // - Main: #home, #about, #departments, #courses, #faculty, #notices, #admissions, #enquiry
  // - Department Views: #departments/computer-engineering, #departments/information-technology,
  //                     #departments/ai-and-ds, #departments/entc
  // - Faculty Views:    #faculty/computer-engineering, #faculty/information-technology,
  //                     #faculty/ai-and-ds, #faculty/entc
  // ================================================================

  // Canonical route to page-view element ID mapping
  const ROUTE_VIEW_MAP = {
    '#home': 'view-home',
    '#about': 'about',
    '#departments': 'departments',
    '#departments/computer-engineering': 'view-dept-computer-engineering',
    '#departments/information-technology': 'view-dept-information-technology',
    '#departments/ai-and-ds': 'view-dept-ai-and-ds',
    '#departments/entc': 'view-dept-entc',
    '#courses': 'courses',
    '#faculty': 'faculty',
    '#faculty/computer-engineering': 'view-faculty-computer-engineering',
    '#faculty/information-technology': 'view-faculty-information-technology',
    '#faculty/ai-and-ds': 'view-faculty-ai-and-ds',
    '#faculty/entc': 'view-faculty-entc',
    '#notices': 'notices',
    '#admissions': 'admissions',
    '#enquiry': 'enquiry'
  };

  // Route alias mapping for alternate path formats and backward compatibility
  const ROUTE_ALIASES = {
    '': '#home',
    '#': '#home',
    // Department aliases
    '#departments/artificial-intelligence-data-science': '#departments/ai-and-ds',
    '#departments/ai-ds': '#departments/ai-and-ds',
    '#departments/aids': '#departments/ai-and-ds',
    '#departments/electronics-telecommunication': '#departments/entc',
    '#departments/extc': '#departments/entc',
    '#dept-computer-engineering': '#departments/computer-engineering',
    '#dept-information-technology': '#departments/information-technology',
    '#dept-ai-and-ds': '#departments/ai-and-ds',
    '#dept-artificial-intelligence-data-science': '#departments/ai-and-ds',
    '#dept-entc': '#departments/entc',
    '#dept-electronics-telecommunication': '#departments/entc',
    // Faculty aliases
    '#faculty/artificial-intelligence-data-science': '#faculty/ai-and-ds',
    '#faculty/ai-ds': '#faculty/ai-and-ds',
    '#faculty/aids': '#faculty/ai-and-ds',
    '#faculty/electronics-telecommunication': '#faculty/entc',
    '#faculty/extc': '#faculty/entc',
    '#faculty-computer-engineering': '#faculty/computer-engineering',
    '#faculty-information-technology': '#faculty/information-technology',
    '#faculty-ai-and-ds': '#faculty/ai-and-ds',
    '#faculty-artificial-intelligence-data-science': '#faculty/ai-and-ds',
    '#faculty-entc': '#faculty/entc',
    '#faculty-electronics-telecommunication': '#faculty/entc'
  };

  // DOM Elements for Navigation
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const allDropdownLinks = document.querySelectorAll('.dropdown-link');
  const dropdownToggleButtons = document.querySelectorAll('.dropdown-toggle-btn');
  const allDropdownParents = document.querySelectorAll('.nav-item-has-dropdown');

  /**
   * Helper: Normalize the current hash to a recognized canonical route.
   * Invalid or missing routes safely fallback to '#home'.
   * @param {string} rawHash - The window.location.hash string
   * @returns {string} Canonical route (e.g., '#departments/computer-engineering')
   */
  function normalizeRoute(rawHash) {
    if (!rawHash) return '#home';
    const cleanHash = rawHash.toLowerCase().trim();

    // Check alias mapping first
    if (ROUTE_ALIASES[cleanHash]) {
      return ROUTE_ALIASES[cleanHash];
    }

    // Check canonical route map
    if (ROUTE_VIEW_MAP[cleanHash]) {
      return cleanHash;
    }

    // Unrecognized route safely defaults to #home
    return '#home';
  }

  /**
   * Helper: Close all open dropdown submenus and reset their aria-expanded state.
   */
  function closeAllDropdowns() {
    allDropdownParents.forEach(function (item) {
      item.classList.remove('is-dropdown-open');
      const btn = item.querySelector('.dropdown-toggle-btn');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });
  }

  /**
   * Helper: Synchronize active highlight on header navigation links.
   * - Marks the current top-level link as active
   * - Keeps parent "Departments" active when on department sub-views
   * - Keeps parent "Faculty" active when on faculty sub-views
   * - Highlights the specific active dropdown item
   * @param {string} currentRoute - The canonical route hash
   */
  function updateActiveNavLink(currentRoute) {
    const isDeptSubRoute = currentRoute.startsWith('#departments');
    const isFacultySubRoute = currentRoute.startsWith('#faculty');

    // Update top-level navigation links
    allNavLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      const isActive =
        href === currentRoute ||
        (href === '#departments' && isDeptSubRoute) ||
        (href === '#faculty' && isFacultySubRoute);

      if (isActive) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });

    // Update dropdown menu links
    allDropdownLinks.forEach(function (dropLink) {
      const dropHref = dropLink.getAttribute('href');
      const isDropActive = dropHref === currentRoute;

      if (isDropActive) {
        dropLink.classList.add('active');
        dropLink.setAttribute('aria-current', 'page');
      } else {
        dropLink.classList.remove('active');
        dropLink.removeAttribute('aria-current');
      }
    });
  }

  /**
   * Main Router Handler:
   * Called on initial page load, page refresh, and on every hashchange event.
   * Switches the active page view, resets scroll position to top,
   * updates navigation highlight, and closes mobile drawers/dropdowns.
   */
  function handleRoute() {
    const canonicalRoute = normalizeRoute(window.location.hash);
    const targetViewId = ROUTE_VIEW_MAP[canonicalRoute] || 'view-home';

    // 1. Hide all page views
    const views = document.querySelectorAll('.page-view');
    views.forEach(function (view) {
      view.classList.remove('active');
    });

    // 2. Display only the selected page view
    const targetView = document.getElementById(targetViewId);
    if (targetView) {
      targetView.classList.add('active');
    } else {
      // Fallback: If target view element is somehow missing, show Home
      const fallbackHome = document.getElementById('view-home');
      if (fallbackHome) fallbackHome.classList.add('active');
    }

    // 3. Immediately reset scroll position to top of page (no scrolling through previous view)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // 4. Update navigation active state
    updateActiveNavLink(canonicalRoute);

    // 5. Close mobile navigation menu and dropdowns if open
    if (navMenu && navMenu.classList.contains('is-open')) {
      navMenu.classList.remove('is-open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }
    closeAllDropdowns();
  }

  // --- Browser Navigation Event: hashchange ---
  // Listens for URL hash changes (link clicks, Back button, Forward button)
  window.addEventListener('hashchange', function () {
    handleRoute();
  });

  // --- Dropdown Toggle Buttons (Mobile tap & accessibility click) ---
  dropdownToggleButtons.forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      const parentItem = button.closest('.nav-item-has-dropdown');
      if (!parentItem) return;

      const willOpen = !parentItem.classList.contains('is-dropdown-open');
      closeAllDropdowns();
      if (willOpen) {
        parentItem.classList.add('is-dropdown-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // --- In-page Anchor Links Handler ---
  // Ensures clicks on internal hash links navigate cleanly even if clicking the currently active route
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function () {
      const targetHash = this.getAttribute('href');
      // If clicking the link of the currently active route, hashchange won't fire, so trigger handleRoute()
      if (window.location.hash === targetHash) {
        handleRoute();
      }
    });
  });

  // --- Close Dropdowns on outside click or Escape key ---
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.nav-item-has-dropdown')) {
      closeAllDropdowns();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeAllDropdowns();
    }
  });

  // --- Mobile Navigation Menu Handlers ---
  if (navToggle && navMenu) {
    // 1. Toggle mobile menu open/closed on hamburger button click
    navToggle.addEventListener('click', function () {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      if (!isOpen) {
        closeAllDropdowns();
      }
    });

    // 2. Close mobile menu when clicking outside of it
    document.addEventListener('click', function (event) {
      if (
        navMenu.classList.contains('is-open') &&
        !navMenu.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        closeAllDropdowns();
      }
    });

    // 3. Close mobile menu when pressing the Escape key
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navMenu.classList.contains('is-open')) {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        closeAllDropdowns();
      }
    });
  }

  // Initial navigation route check on first page load or refresh
  handleRoute();

  // ================================================================
  // 4. Fetch API — Load Dynamic Content from JSON Files
  // ================================================================
  // The Fetch API lets the browser request files from the server
  // without reloading the page. We use async/await to wait for the
  // response before we try to use the data.
  //
  // All three fetch calls run at the same time using Promise.all(),
  // so the page loads all three sections simultaneously.
  // ================================================================

  loadAllSections();

  // ----------------------------------------------------------------
  // 4a. loadAllSections() — trigger all three fetch calls together
  // ----------------------------------------------------------------
  async function loadAllSections() {
    // Run all three fetches at the same time (parallel, not sequential)
    // Promise.all() waits until ALL three are done before continuing
    await Promise.all([
      loadDepartments(),
      loadFaculty(),
      loadNotices()
    ]);

    // If the page was opened or refreshed with a specific hash, ensure the proper view is displayed
    if (window.location.hash && window.location.hash !== '#home') {
      handleRoute();
    }
  }

  // ----------------------------------------------------------------
  // 4b. loadDepartments() — fetch data/departments.json
  // ----------------------------------------------------------------
  async function loadDepartments() {
    var grid = document.getElementById('departments-grid');
    if (!grid) { return; } // Safety: if the container is missing, do nothing

    try {
      // Step 1: Send an HTTP GET request to departments.json
      var response = await fetch('data/departments.json');

      // Step 2: Check that the server responded with a success status (200 OK)
      if (!response.ok) {
        throw new Error('Could not load departments data (HTTP ' + response.status + ')');
      }

      // Step 3: Parse the response body as JSON → converts JSON text into a JS array
      var departments = await response.json();

      // Step 4: Clear the loading message
      grid.textContent = '';

      // Step 5: Build a card for each department object in the array
      departments.forEach(function (dept) {
        var article = document.createElement('article');
        article.className = dept.featured
          ? 'dept-full-card featured'
          : 'dept-full-card';

        // --- Card visual header ---
        var visual = document.createElement('div');
        visual.className = 'dept-card-visual';

        // Department icon circle (generic user/group SVG — same for all departments)
        var iconCircle = document.createElement('div');
        iconCircle.className = 'dept-icon-circle';
        // We use a safe SVG string here — this is our own static markup, not user input
        iconCircle.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>';

        var badge = document.createElement('span');
        badge.className = 'section-badge';
        badge.textContent = dept.badge; // textContent is safe — no HTML injection risk

        visual.appendChild(iconCircle);
        visual.appendChild(badge);

        // --- Department name ---
        var title = document.createElement('h3');
        title.className = 'dept-full-title';
        title.textContent = dept.name;

        // --- Description paragraph ---
        var desc = document.createElement('p');
        desc.className = 'dept-full-desc';
        desc.textContent = dept.description;

        // --- Focus areas ---
        var focusWrapper = document.createElement('div');
        focusWrapper.className = 'dept-focus-areas';

        var focusLabel = document.createElement('span');
        focusLabel.className = 'dept-focus-label';
        focusLabel.textContent = 'Core Study Areas';

        var tagsWrapper = document.createElement('div');
        tagsWrapper.className = 'dept-focus-tags';

        // Loop through the focusAreas array and create a tag for each item
        dept.focusAreas.forEach(function (area) {
          var tag = document.createElement('span');
          tag.className = 'dept-tag';
          tag.textContent = area;
          tagsWrapper.appendChild(tag);
        });

        focusWrapper.appendChild(focusLabel);
        focusWrapper.appendChild(tagsWrapper);

        // Assemble all parts into the article card
        article.appendChild(visual);
        article.appendChild(title);
        article.appendChild(desc);
        article.appendChild(focusWrapper);

        grid.appendChild(article);
      });

    } catch (error) {
      // catch runs if fetch() fails (e.g. file not found, no server, bad JSON)
      console.error('Departments fetch error:', error);
      showFetchError(grid, 'Could not load department information. Please try again.');
    }
  }

  // ----------------------------------------------------------------
  // 4c. Department Faculty Metadata Configuration & Helpers
  // ----------------------------------------------------------------
  const DEPARTMENTS_FACULTY_META = [
    {
      name: 'Computer Engineering',
      slug: 'computer-engineering',
      route: '#faculty/computer-engineering',
      containerId: 'faculty-cards-computer-engineering',
      badge: 'UG • PG Department',
      role: 'Computational & Software Systems Mentors',
      description: 'Faculty mentors guiding students across computation theory, algorithm design, software architecture, and cloud infrastructure.',
      highlights: ['4 Faculty Profiles', 'Distributed Systems', 'Algorithms & Cloud'],
      featured: false
    },
    {
      name: 'Information Technology',
      slug: 'information-technology',
      route: '#faculty/information-technology',
      containerId: 'faculty-cards-information-technology',
      badge: 'UG Program',
      role: 'Enterprise Web & Security Mentors',
      description: 'Faculty instructors specializing in full-stack web technologies, cybersecurity protocols, cloud infrastructure, and database engineering.',
      highlights: ['4 Faculty Profiles', 'Cybersecurity', 'Full-Stack Web'],
      featured: false
    },
    {
      name: 'Artificial Intelligence and Data Science',
      slug: 'ai-and-ds',
      route: '#faculty/ai-and-ds',
      containerId: 'faculty-cards-ai-and-ds',
      badge: 'Emerging Tech',
      role: 'Machine Learning & Big Data Mentors',
      description: 'Specialized mentors instructing deep learning models, natural language processing, predictive modeling, and large-scale data analytics.',
      highlights: ['4 Faculty Profiles', 'Deep Learning', 'NLP & Big Data'],
      featured: true
    },
    {
      name: 'Electronics and Telecommunication',
      slug: 'entc',
      route: '#faculty/entc',
      containerId: 'faculty-cards-entc',
      badge: 'UG • PG Department',
      role: 'VLSI, Embedded & IoT Systems Mentors',
      description: 'Educators in semiconductor microelectronics, embedded microcontrollers, 5G wireless communication, and digital signal processing.',
      highlights: ['4 Faculty Profiles', 'VLSI Design', '5G & Embedded IoT'],
      featured: false
    }
  ];

  /**
   * Helper: Extracts initials from a faculty member's name.
   * Strips academic titles (Dr., Prof., Mr., Mrs., Ms.) and returns two letters.
   * e.g., "Dr. Sunita R. Joshi" -> "SJ"
   * @param {string} fullName - Faculty member's display name
   * @returns {string} 2-letter uppercase initials
   */
  function getInitials(fullName) {
    if (!fullName) return 'FC';
    var clean = fullName.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').trim();
    var parts = clean.split(/\s+/).filter(function (part) {
      return part.replace(/[^a-zA-Z]/g, '').length > 0;
    });
    if (parts.length === 0) return 'FC';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * Helper: Creates a Department Overview Card for the main #faculty directory grid.
   * Displays department title, badge, mentorship role, description, and link to the dedicated view.
   * @param {Object} deptMeta - Department metadata object
   * @param {number} profileCount - Total loaded faculty profiles for this department
   * @returns {HTMLElement} article.faculty-card element
   */
  function createDepartmentFacultyCard(deptMeta, profileCount) {
    var article = document.createElement('article');
    article.className = deptMeta.featured
      ? 'faculty-card faculty-card-featured'
      : 'faculty-card';

    // Enable smooth navigation on full card click
    article.style.cursor = 'pointer';
    article.addEventListener('click', function (event) {
      if (event.target.tagName !== 'A') {
        window.location.hash = deptMeta.route;
      }
    });

    // --- Card Header: Avatar Icon + Badge ---
    var cardHeader = document.createElement('div');
    cardHeader.className = 'faculty-card-header';

    var avatar = document.createElement('div');
    avatar.className = deptMeta.featured
      ? 'faculty-avatar faculty-avatar-featured'
      : 'faculty-avatar';
    avatar.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>';

    var badgeEl = document.createElement('span');
    badgeEl.className = deptMeta.featured
      ? 'faculty-badge faculty-badge-highlight'
      : 'faculty-badge';
    badgeEl.textContent = deptMeta.badge;

    cardHeader.appendChild(avatar);
    cardHeader.appendChild(badgeEl);

    // --- Department Title ---
    var deptTitle = document.createElement('h3');
    deptTitle.className = 'faculty-dept-title';
    deptTitle.textContent = deptMeta.name;

    // --- Mentorship Role / Subtitle ---
    var roleEl = document.createElement('p');
    roleEl.className = 'faculty-role';
    roleEl.textContent = deptMeta.role;

    // --- Description ---
    var descEl = document.createElement('p');
    descEl.className = 'faculty-desc';
    descEl.textContent = deptMeta.description;

    // --- Meta Highlights ---
    var metaDiv = document.createElement('div');
    metaDiv.className = 'faculty-meta';

    deptMeta.highlights.forEach(function (item) {
      var metaSpan = document.createElement('span');
      metaSpan.className = 'faculty-meta-item';
      metaSpan.textContent = item;
      metaDiv.appendChild(metaSpan);
    });

    // --- Action CTA Link to Department Faculty Page ---
    var ctaLink = document.createElement('a');
    ctaLink.className = 'btn btn-secondary faculty-dept-cta';
    ctaLink.setAttribute('href', deptMeta.route);
    ctaLink.textContent = 'View ' + deptMeta.name + ' Faculty \u2192';

    // Assemble Card
    article.appendChild(cardHeader);
    article.appendChild(deptTitle);
    article.appendChild(roleEl);
    article.appendChild(descEl);
    article.appendChild(metaDiv);
    article.appendChild(ctaLink);

    return article;
  }

  /**
   * Helper: Creates an individual Faculty Profile Card using safe DOM methods.
   * Displays Name, Designation, Qualification, Experience, Description, and Initials Avatar.
   * @param {Object} member - Individual faculty profile object from data/faculty.json
   * @returns {HTMLElement} article.faculty-profile-card element
   */
  function createFacultyProfileCard(member) {
    var card = document.createElement('article');
    card.className = 'faculty-profile-card';

    // --- Card Header: Avatar Initials + Name + Designation ---
    var header = document.createElement('div');
    header.className = 'faculty-profile-card-header';

    var avatar = document.createElement('div');
    avatar.className = 'faculty-avatar-initials';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = getInitials(member.name);

    var info = document.createElement('div');
    info.className = 'faculty-profile-header-info';

    var nameEl = document.createElement('h3');
    nameEl.className = 'faculty-profile-name';
    nameEl.textContent = member.name;

    var desigEl = document.createElement('p');
    desigEl.className = 'faculty-profile-designation';
    desigEl.textContent = member.designation;

    info.appendChild(nameEl);
    info.appendChild(desigEl);
    header.appendChild(avatar);
    header.appendChild(info);

    // --- Academic Details Box: Qualification & Experience ---
    var details = document.createElement('div');
    details.className = 'faculty-profile-details';

    // Qualification Row
    var qualRow = document.createElement('div');
    qualRow.className = 'faculty-detail-row';
    var qualLabel = document.createElement('span');
    qualLabel.className = 'faculty-detail-label';
    qualLabel.textContent = 'Qualification:';
    var qualVal = document.createElement('span');
    qualVal.className = 'faculty-detail-value';
    qualVal.textContent = member.qualification;
    qualRow.appendChild(qualLabel);
    qualRow.appendChild(qualVal);

    // Experience Row
    var expRow = document.createElement('div');
    expRow.className = 'faculty-detail-row';
    var expLabel = document.createElement('span');
    expLabel.className = 'faculty-detail-label';
    expLabel.textContent = 'Experience:';
    var expVal = document.createElement('span');
    expVal.className = 'faculty-detail-value';
    expVal.textContent = member.experience;
    expRow.appendChild(expLabel);
    expRow.appendChild(expVal);

    details.appendChild(qualRow);
    details.appendChild(expRow);

    // --- Short Professional Description ---
    var descEl = document.createElement('p');
    descEl.className = 'faculty-profile-desc';
    descEl.textContent = member.description;

    // --- Card Footer: Department Badge & Experience Pill ---
    var footer = document.createElement('div');
    footer.className = 'faculty-profile-footer';

    var deptBadge = document.createElement('span');
    deptBadge.className = 'faculty-dept-badge';
    deptBadge.textContent = member.department;

    var expPill = document.createElement('span');
    expPill.className = 'faculty-experience-pill';
    expPill.textContent = member.experience;

    footer.appendChild(deptBadge);
    footer.appendChild(expPill);

    // Assemble Card
    card.appendChild(header);
    card.appendChild(details);
    card.appendChild(descEl);
    card.appendChild(footer);

    return card;
  }

  // ----------------------------------------------------------------
  // 4c. loadFaculty() — fetch data/faculty.json & render directory + department profiles
  // ----------------------------------------------------------------
  async function loadFaculty() {
    var mainGrid = document.getElementById('faculty-grid');

    try {
      var response = await fetch('data/faculty.json');

      if (!response.ok) {
        throw new Error('Could not load faculty data (HTTP ' + response.status + ')');
      }

      var facultyList = await response.json();

      // 1. Render Main Faculty Directory (#faculty-grid)
      if (mainGrid) {
        mainGrid.textContent = '';
        DEPARTMENTS_FACULTY_META.forEach(function (deptMeta) {
          var count = facultyList.filter(function (m) {
            return m.department === deptMeta.name;
          }).length;
          var deptCard = createDepartmentFacultyCard(deptMeta, count);
          mainGrid.appendChild(deptCard);
        });
      }

      // 2. Render Department-Specific Faculty Views (#faculty/...)
      DEPARTMENTS_FACULTY_META.forEach(function (deptMeta) {
        var container = document.getElementById(deptMeta.containerId);
        if (!container) return;

        // Clear loading placeholder
        container.textContent = '';

        // Filter faculty members specifically belonging to this department
        var deptProfiles = facultyList.filter(function (member) {
          return member.department === deptMeta.name;
        });

        if (deptProfiles.length === 0) {
          var emptyMsg = document.createElement('p');
          emptyMsg.className = 'fetch-loading-message';
          emptyMsg.textContent = 'No faculty profiles found for ' + deptMeta.name + '.';
          container.appendChild(emptyMsg);
          return;
        }

        deptProfiles.forEach(function (member) {
          var card = createFacultyProfileCard(member);
          container.appendChild(card);
        });
      });

    } catch (error) {
      console.error('Faculty fetch error:', error);
      if (mainGrid) {
        showFetchError(mainGrid, 'Could not load faculty directory. Please try again.');
      }
      DEPARTMENTS_FACULTY_META.forEach(function (deptMeta) {
        var container = document.getElementById(deptMeta.containerId);
        if (container) {
          showFetchError(container, 'Could not load faculty profiles. Please try again.');
        }
      });
    }
  }

  // ----------------------------------------------------------------
  // 4d. loadNotices() — fetch data/notices.json
  // ----------------------------------------------------------------
  async function loadNotices() {
    var grid = document.getElementById('notices-board-grid');
    if (!grid) { return; }

    try {
      var response = await fetch('data/notices.json');

      if (!response.ok) {
        throw new Error('Could not load notices data (HTTP ' + response.status + ')');
      }

      var notices = await response.json();

      // Clear the loading message
      grid.textContent = '';

      notices.forEach(function (notice) {
        var article = document.createElement('article');
        article.className = 'notice-board-card';

        // --- Notice header: category badge + date ---
        var headerDiv = document.createElement('div');
        headerDiv.className = 'notice-board-header';

        var catBadge = document.createElement('span');
        // We only assign our own class strings from JSON, not raw HTML
        catBadge.className = 'notice-category-badge ' + notice.categoryClass;
        catBadge.textContent = notice.category;

        var timeEl = document.createElement('time');
        timeEl.className = 'notice-board-date';
        timeEl.setAttribute('datetime', notice.dateTime);
        timeEl.textContent = notice.date;

        headerDiv.appendChild(catBadge);
        headerDiv.appendChild(timeEl);

        // --- Notice title ---
        var titleEl = document.createElement('h3');
        titleEl.className = 'notice-board-title';
        titleEl.textContent = notice.title;

        // --- Description ---
        var descEl = document.createElement('p');
        descEl.className = 'notice-board-desc';
        descEl.textContent = notice.description;

        // --- Footer: demo tag + read more ---
        var footerDiv = document.createElement('div');
        footerDiv.className = 'notice-board-footer';

        var demoTag = document.createElement('span');
        demoTag.className = 'notice-demo-tag';
        // Show "Sample / Demo Notice" if demo:true in JSON
        demoTag.textContent = notice.demo ? 'Sample / Demo Notice' : '';

        var readMore = document.createElement('span');
        readMore.className = 'notice-read-more';
        readMore.textContent = 'View Circular \u2192';

        footerDiv.appendChild(demoTag);
        footerDiv.appendChild(readMore);

        // Assemble card
        article.appendChild(headerDiv);
        article.appendChild(titleEl);
        article.appendChild(descEl);
        article.appendChild(footerDiv);

        grid.appendChild(article);
      });

    } catch (error) {
      console.error('Notices fetch error:', error);
      showFetchError(grid, 'Could not load notices. Please try again.');
    }
  }

  // ----------------------------------------------------------------
  // 4e. showFetchError() — display a friendly error message in a grid
  // ----------------------------------------------------------------
  function showFetchError(container, message) {
    // Clear whatever was in the container (loading message or partial content)
    container.textContent = '';

    var errorMsg = document.createElement('p');
    errorMsg.className = 'fetch-error-message';
    errorMsg.textContent = message;
    container.appendChild(errorMsg);
  }

  // ----------------------------------------------------------------
  // 3. Student Enquiry Form — Validation, localStorage & Display
  // ----------------------------------------------------------------

  // The key used to store all enquiries in localStorage
  var STORAGE_KEY = 'collegeEnquiries';

  var enquiryForm = document.getElementById('enquiry-form');
  var formMessage  = document.getElementById('form-message');
  var enquiryList  = document.getElementById('enquiry-list');

  // Only run if the enquiry form exists on the page
  if (enquiryForm && formMessage) {

    // ----------------------------------------------------------
    // 3a. Load saved enquiries on page load and show them
    // ----------------------------------------------------------
    // On first load (or after a browser refresh) we read whatever
    // is already stored and display it immediately.
    renderEnquiries();

    // ----------------------------------------------------------
    // 3b. Form submit handler
    // ----------------------------------------------------------
    enquiryForm.addEventListener('submit', function (event) {
      // Prevent the browser from reloading the page on form submit
      event.preventDefault();

      // --- Read and trim all field values ---
      var fullName   = document.getElementById('fullName').value.trim();
      var email      = document.getElementById('email').value.trim();
      var phone      = document.getElementById('phone').value.trim();
      var department = document.getElementById('department').value;
      var message    = document.getElementById('message').value.trim();

      // Clear any previous feedback message and reset its styling
      formMessage.textContent = '';
      formMessage.className   = 'form-message';

      // --- Validation checks (sequential; stop at the first failure) ---

      // Check: Full Name must be at least 3 characters
      if (fullName.length < 3) {
        showFormMessage('Please enter your full name (minimum 3 characters).', 'form-message--error');
        return;
      }

      // Check: Email must match a basic valid format using a regular expression
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showFormMessage('Please enter a valid email address.', 'form-message--error');
        return;
      }

      // Check: Phone is optional — but if provided it must be exactly 10 digits
      if (phone !== '' && !/^[0-9]{10}$/.test(phone)) {
        showFormMessage('Phone number must be exactly 10 digits (numbers only).', 'form-message--error');
        return;
      }

      // Check: A department must be selected
      if (department === '') {
        showFormMessage('Please select a department of interest.', 'form-message--error');
        return;
      }

      // Check: Message must be at least 10 characters
      if (message.length < 10) {
        showFormMessage('Please enter a message of at least 10 characters.', 'form-message--error');
        return;
      }

      // --- All validations passed — save to localStorage ---
      saveEnquiry(fullName, email, phone, department, message);

      // Show success feedback and clear the form
      showFormMessage('Thank you! Your enquiry has been submitted successfully. We will get back to you soon.', 'form-message--success');
      enquiryForm.reset();
    });

    // ----------------------------------------------------------
    // 3c. Helper: display a message inside #form-message
    // ----------------------------------------------------------
    function showFormMessage(text, cssClass) {
      formMessage.textContent = text;
      formMessage.classList.add(cssClass);
    }

    // ----------------------------------------------------------
    // 3d. saveEnquiry() — build an object and store in localStorage
    // ----------------------------------------------------------
    function saveEnquiry(fullName, email, phone, department, message) {

      // Step 1: Build a plain JavaScript object to represent this enquiry.
      //         We also record the date/time so we can display it later.
      var newEnquiry = {
        name:       fullName,
        email:      email,
        phone:      phone || 'Not provided',   // Show a fallback if empty
        department: department,
        message:    message,
        submittedAt: new Date().toLocaleString() // Human-readable timestamp
      };

      // Step 2: Retrieve the existing saved enquiries from localStorage.
      //         localStorage only stores strings, so we use JSON.parse()
      //         to convert the stored JSON string back into a JS array.
      var stored = localStorage.getItem(STORAGE_KEY);
      var enquiries = [];

      // If there is saved data and it is valid JSON, parse it
      if (stored) {
        try {
          enquiries = JSON.parse(stored); // Convert JSON string → JS array
          // Safety check: make sure we have an array, not some other value
          if (!Array.isArray(enquiries)) {
            enquiries = [];
          }
        } catch (error) {
          // If the stored data is corrupted, start fresh
          enquiries = [];
        }
      }

      // Step 3: Add the new enquiry object to the array
      enquiries.push(newEnquiry);

      // Step 4: Save the updated array back to localStorage.
      //         localStorage.setItem() only accepts strings, so we use
      //         JSON.stringify() to convert the JS array → JSON string.
      localStorage.setItem(STORAGE_KEY, JSON.stringify(enquiries));

      // Step 5: Refresh the displayed list of enquiries on the page
      renderEnquiries();
    }

    // ----------------------------------------------------------
    // 3e. renderEnquiries() — read localStorage and display cards
    // ----------------------------------------------------------
    function renderEnquiries() {
      // If the enquiry list container does not exist, nothing to do
      if (!enquiryList) { return; }

      // Clear the container before re-rendering to avoid duplicates
      enquiryList.textContent = '';

      // Read saved enquiries from localStorage
      var stored = localStorage.getItem(STORAGE_KEY);
      var enquiries = [];

      if (stored) {
        try {
          enquiries = JSON.parse(stored);
          if (!Array.isArray(enquiries)) { enquiries = []; }
        } catch (error) {
          enquiries = [];
        }
      }

      // Show or hide the whole panel based on whether data exists
      var wrapper = document.getElementById('submitted-enquiries-wrapper');

      if (enquiries.length === 0) {
        // Show the panel with an empty-state message
        if (wrapper) { wrapper.style.display = 'block'; }

        var emptyMsg = document.createElement('p');
        emptyMsg.className   = 'enquiry-empty-message';
        emptyMsg.textContent = 'No enquiries submitted yet.';
        enquiryList.appendChild(emptyMsg);
        return;
      }

      // Data exists — show the panel
      if (wrapper) { wrapper.style.display = 'block'; }

      // Loop through enquiries in reverse order (newest first)
      for (var i = enquiries.length - 1; i >= 0; i--) {
        var item = enquiries[i];

        // Build the card using safe DOM methods (never innerHTML with user data)
        var card = document.createElement('div');
        card.className = 'enquiry-saved-card';

        // --- Card header: name + timestamp ---
        var cardHeader = document.createElement('div');
        cardHeader.className = 'enquiry-saved-card-header';

        var nameEl = document.createElement('span');
        nameEl.className   = 'enquiry-saved-name';
        nameEl.textContent = item.name;

        var timeEl = document.createElement('span');
        timeEl.className   = 'enquiry-saved-time';
        timeEl.textContent = item.submittedAt;

        cardHeader.appendChild(nameEl);
        cardHeader.appendChild(timeEl);

        // --- Card body: detail rows ---
        var cardBody = document.createElement('div');
        cardBody.className = 'enquiry-saved-card-body';

        // Helper: create a labelled detail row safely
        function makeRow(label, value) {
          var row = document.createElement('p');
          row.className = 'enquiry-saved-row';

          var labelEl = document.createElement('strong');
          labelEl.textContent = label + ': ';

          var valueEl = document.createElement('span');
          valueEl.textContent = value;

          row.appendChild(labelEl);
          row.appendChild(valueEl);
          return row;
        }

        cardBody.appendChild(makeRow('Email',      item.email));
        cardBody.appendChild(makeRow('Phone',      item.phone));
        cardBody.appendChild(makeRow('Department', item.department));
        cardBody.appendChild(makeRow('Message',    item.message));

        // Assemble the card
        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        enquiryList.appendChild(card);
      }
    }

  } // end if (enquiryForm && formMessage)

  // ================================================================
  // 5. Expandable Course Details Toggle Handler
  // ================================================================
  // Handles click events on all .course-toggle-btn buttons in the
  // Courses section. Expands or collapses the corresponding course
  // details panel, switches the button text between "View Details"
  // and "Hide Details", and updates accessibility attributes
  // (aria-expanded on the button and aria-hidden on the panel).
  // ================================================================
  const courseToggleButtons = document.querySelectorAll('.course-toggle-btn');

  courseToggleButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const controlsId = button.getAttribute('aria-controls');
      if (!controlsId) return;

      const panel = document.getElementById(controlsId);
      if (!panel) return;

      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const willExpand = !isExpanded;

      // Toggle aria-expanded and button label
      button.setAttribute('aria-expanded', String(willExpand));
      const textSpan = button.querySelector('.toggle-btn-text');
      if (textSpan) {
        textSpan.textContent = willExpand ? 'Hide Details' : 'View Details';
      }

      // Toggle panel visibility and transition class
      panel.setAttribute('aria-hidden', String(!willExpand));
      if (willExpand) {
        panel.classList.add('is-expanded');
      } else {
        panel.classList.remove('is-expanded');
      }
    });
  });

});
