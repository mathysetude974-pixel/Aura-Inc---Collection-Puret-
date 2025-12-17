// Effet d'apparition fluide sur les sections au scroll (Intersection Observer)
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('section, .footer');
    const observer = new window.IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-on-scroll');
            }
        });
    }, { threshold: 0.08 });
    sections.forEach(section => {
        section.classList.add('hide-on-scroll');
        observer.observe(section);
    });
});
