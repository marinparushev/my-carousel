const MOBILE_THRESHOLD = 768;
const TABLET_THRESHOLD = 1024;

export const getDeviceTypeByScreenSize = () => {
    const width = window.innerWidth;
    if (width <= MOBILE_THRESHOLD) {
        return 'Mobile';
    } else if (width > MOBILE_THRESHOLD && width <= TABLET_THRESHOLD) {
        return 'Tablet';
    } else {
        return 'Desktop';
    }
};
