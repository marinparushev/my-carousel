import {Carousel} from './components/Carousel';
import {useIsPortrait} from './hooks/use-is-portrait.hook';
import {getDeviceTypeByScreenSize} from './utils/device-utils';

import './App.css';

const images = Array.from({length: 1000}, (_, i) => `https://picsum.photos/id/${i}/400/300`);
images.push('https://picsum.photos/id/1000/1000/200');
images.push('https://picsum.photos/id/1001/200/1000');

function App() {
    const deviceType = getDeviceTypeByScreenSize();
    const isPortrait = useIsPortrait();
    const className = isPortrait || deviceType === 'Mobile' ? '' : 'padding-vertical';

    return (
        <div id="carousel-container" className={className}>
            <Carousel images={images} />
        </div>
    );
}

export default App;
