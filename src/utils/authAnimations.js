import gsap from 'gsap';

/**
 * Entrance animation for Auth cards and child elements.
 * @param {HTMLElement} cardRef - Card DOM element
 * @param {string} childrenSelector - CSS selector for staggered children
 */
export function animateAuthEntrance(cardRef, childrenSelector = '[data-auth-anim]') {
  if (!cardRef) return;

  const ctx = gsap.context(() => {
    // Card pop-in & gentle float up
    gsap.fromTo(
      cardRef,
      {
        opacity: 0,
        y: 28,
        scale: 0.96,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        ease: 'power3.out',
      }
    );

    // Staggered children entrance
    const children = cardRef.querySelectorAll(childrenSelector);
    if (children.length > 0) {
      gsap.fromTo(
        children,
        {
          opacity: 0,
          y: 16,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
          delay: 0.12,
        }
      );
    }
  }, cardRef);

  return () => ctx.revert();
}

/**
 * Micro-shake animation for invalid form submissions or auth errors.
 * @param {HTMLElement} targetRef 
 */
export function animateErrorShake(targetRef) {
  if (!targetRef) return;
  gsap.fromTo(
    targetRef,
    { x: 0 },
    {
      x: [-8, 8, -6, 6, -3, 3, 0],
      duration: 0.45,
      ease: 'power2.inOut',
    }
  );
}

/**
 * Continuous subtle floating animation for auth badge icons.
 * @param {HTMLElement} iconRef 
 */
export function animateFloatingBadge(iconRef) {
  if (!iconRef) return;
  const tween = gsap.to(iconRef, {
    y: -5,
    duration: 2.2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
  return () => tween.kill();
}
