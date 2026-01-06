import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mobile-container flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <div className="text-6xl font-bold text-primary-300 mb-4">404</div>
      <h1 className="text-xl font-semibold mb-2">페이지를 찾을 수 없습니다</h1>
      <p className="text-primary-500 mb-8">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => window.history.back()}
          className="btn btn-outline"
        >
          <ArrowLeft size={18} />
          뒤로가기
        </button>
        <Link to="/" className="btn btn-primary">
          <Home size={18} />
          홈으로
        </Link>
      </div>
    </div>
  );
}

