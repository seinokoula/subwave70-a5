export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (window.innerWidth <= 768) ||
    ('ontouchstart' in window);
};

export const getDevicePerformanceLevel = () => {
  if (typeof window === 'undefined') return 'high';

  const isMobile = isMobileDevice();
  const memory = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;

  if (isMobile && (memory < 4 || cores < 4)) {
    return 'low';
  } else if (isMobile || memory < 6) {
    return 'medium';
  }

  return 'high';
};
