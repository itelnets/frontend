import Spinner from './Spinner';

export default function PageLoader() {
    return (
        <div className="fixed inset-0 flex items-center justify-center font-sans z-[100] bg-white">
            <Spinner className="w-8 h-8 sm:h-12 sm:w-12 text-green-600" />
        </div>
    );
}
