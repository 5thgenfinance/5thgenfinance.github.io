      // Icons — progressive enhancement
      if (typeof lucide !== "undefined" && typeof lucide.createIcons === "function") {
        lucide.createIcons();
      }

      // ===== Mobile Menu =====
      const mobileMenuBtn = document.getElementById('mobile-menu-btn-c3d4');
      const mobileMenu = document.getElementById('mobile-menu-e5f6');
      const mobileMenuClose = document.getElementById('mobile-menu-close-g7h8');

      if (mobileMenuBtn && mobileMenu && mobileMenuClose) {
        mobileMenuBtn.addEventListener('click', function () {
          mobileMenu.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
        });

        mobileMenuClose.addEventListener('click', function () {
          mobileMenu.classList.add('hidden');
          document.body.style.overflow = '';
        });

        // Close mobile menu when a nav link is clicked
        document.querySelectorAll('.mobile-nav-link').forEach(function (link) {
          link.addEventListener('click', function () {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
          });
        });
      }

      // ===== Copy Hex Buttons =====
      document.querySelectorAll('.copy-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var hex = btn.getAttribute('data-hex');
          if (hex && navigator.clipboard) {
            navigator.clipboard.writeText(hex).then(function () {
              var original = btn.textContent;
              btn.textContent = 'Copied!';
              btn.style.backgroundColor = '#c49a4a';
              setTimeout(function () {
                btn.textContent = original;
                btn.style.backgroundColor = '';
              }, 1500);
            });
          }
        });
      });

      // ===== Active Nav Highlighting =====
      var sections = document.querySelectorAll('section[id]');
      var navLinks = document.querySelectorAll('.nav-link');

      function updateActiveNav() {
        var scrollPos = window.scrollY + 100;
        sections.forEach(function (section) {
          var top = section.offsetTop;
          var height = section.offsetHeight;
          var id = section.getAttribute('id');

          if (scrollPos >= top && scrollPos < top + height) {
            navLinks.forEach(function (link) {
              link.classList.remove('active');
              link.style.color = '';
              if (link.getAttribute('href') === '#' + id) {
                link.classList.add('active');
                link.style.color = '#c49a4a';
              }
            });
          }
        });
      }

      window.addEventListener('scroll', updateActiveNav);
      updateActiveNav();