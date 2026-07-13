import Spinner from './Spinner';

export default function PageLoader() {
    return (
        <div className="flex items-center justify-center h-[60vh] w-full font-sans">
            <Spinner className="w-8 h-8 text-green-600" />
        </div>
    );
}
