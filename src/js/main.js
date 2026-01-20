document.addEventListener('DOMContentLoaded', function() {
  const burgerMenu = document.getElementById('burgerMenu');
  const mobileNavPanel = document.getElementById('mobileNavPanel');
  
  if (burgerMenu && mobileNavPanel) {
    burgerMenu.addEventListener('click', function() {
      const isExpanded = mobileNavPanel.classList.toggle('active');

      // Update ARIA attributes for accessibility
      burgerMenu.setAttribute('aria-expanded', isExpanded);
      mobileNavPanel.setAttribute('aria-hidden', !isExpanded);

      // Animate burger menu
      const spans = burgerMenu.querySelectorAll('span');
      if (isExpanded) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && mobileNavPanel.classList.contains('active')) {
        mobileNavPanel.classList.remove('active');
        burgerMenu.setAttribute('aria-expanded', 'false');
        mobileNavPanel.setAttribute('aria-hidden', 'true');
        const spans = burgerMenu.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
        burgerMenu.focus();
      }
    });
  }
  
  // Smooth scrolling for navigation links with accordion integration
  const navLinks = document.querySelectorAll('.nav-link, .bottom-nav-item');
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');

      // Parse section ID from href (handles both "#about" and "/#about")
      let sectionId = href;
      if (href.startsWith('/#')) {
        sectionId = href.substring(2);
      } else if (href.startsWith('#')) {
        sectionId = href.substring(1);
      } else {
        return; // Not a hash link, let default behavior proceed
      }

      const targetElement = document.getElementById(sectionId);

      // If on blog.html and target doesn't exist, redirect to index.html
      if (!targetElement && window.location.pathname.includes('blog.html')) {
        window.location.href = '/#' + sectionId;
        return;
      }

      // If target exists on current page
      if (targetElement) {
        e.preventDefault();

        // Expand accordion if on mobile
        if (window.mobileAccordion && window.mobileAccordion.isMobile) {
          window.mobileAccordion.expandById(sectionId);
        }

        // Scroll to section with offset for mobile nav
        const mobileNav = document.querySelector('.mobile-nav');
        const mobileNavHeight = mobileNav ? mobileNav.offsetHeight : 0;
        const isMobile = window.innerWidth <= 1024;
        const offset = isMobile ? mobileNavHeight + 16 : 0;

        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });

        // Close mobile nav if open
        if (mobileNavPanel && mobileNavPanel.classList.contains('active')) {
          mobileNavPanel.classList.remove('active');
          burgerMenu.setAttribute('aria-expanded', 'false');
          mobileNavPanel.setAttribute('aria-hidden', 'true');
          const spans = burgerMenu.querySelectorAll('span');
          spans[0].style.transform = 'none';
          spans[1].style.opacity = '1';
          spans[2].style.transform = 'none';
        }
      }
    });
  });
  
  // Add scroll effect to sections
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observe all sections
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(section);
  });
});