import { useEffect, useState } from 'react';
import { Search, Check, X, Copy, ExternalLink } from 'lucide-react';
import { requestRepository, approvalService } from '../../lib/storage';
import type { Request, RequestStatus } from '../../types';

type TabType = 'all' | RequestStatus;

export default function AdminRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [approvalResult, setApprovalResult] = useState<{
    editUrl: string;
    publicUrl: string;
    shopName: string;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchQuery, activeTab]);

  const loadRequests = () => {
    const data = requestRepository.getAll();
    setRequests(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const filterRequests = () => {
    let filtered = [...requests];

    if (activeTab !== 'all') {
      filtered = filtered.filter((r) => r.status === activeTab);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.shopName.toLowerCase().includes(query) ||
          r.managerName.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const handleApprove = (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    const result = approvalService.approveRequest(requestId);
    if (result) {
      setApprovalResult({
        editUrl: window.location.origin + result.editUrl,
        publicUrl: window.location.origin + result.publicUrl,
        shopName: request.shopName,
      });
      loadRequests();
    }
  };

  const handleReject = (requestId: string) => {
    if (confirm('이 신청을 반려하시겠습니까?')) {
      approvalService.rejectRequest(requestId);
      loadRequests();
      showToast('신청이 반려되었습니다.');
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} 복사됨`);
    } catch {
      showToast('복사 실패');
    }
  };

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const getStatusBadge = (status: RequestStatus) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
    };
    const labels = {
      pending: '대기',
      approved: '승인',
      rejected: '반려',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'pending', label: '대기', count: requests.filter((r) => r.status === 'pending').length },
    { key: 'approved', label: '승인', count: requests.filter((r) => r.status === 'approved').length },
    { key: 'rejected', label: '반려', count: requests.filter((r) => r.status === 'rejected').length },
    { key: 'all', label: '전체', count: requests.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">신청 관리</h1>
        <p className="text-primary-500 mt-1">거래처 신청을 검토하고 승인하세요</p>
      </div>

      {/* Search & Tabs */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400" size={20} />
          <input
            type="text"
            placeholder="매장명 또는 담당자 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-900 text-white'
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Request List */}
      <div className="card divide-y divide-primary-100">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center text-primary-400">
            {searchQuery ? '검색 결과가 없습니다' : '신청 내역이 없습니다'}
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{request.shopName}</h3>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-sm text-primary-500">{request.managerName}</p>
                  {request.phone && (
                    <p className="text-sm text-primary-400">{request.phone}</p>
                  )}
                  {request.notes && (
                    <p className="text-sm text-primary-400 mt-1">{request.notes}</p>
                  )}
                  <p className="text-xs text-primary-300 mt-2">
                    {new Date(request.createdAt).toLocaleString('ko-KR')}
                  </p>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                      title="승인"
                    >
                      <Check size={20} />
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      title="반려"
                    >
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Approval Result Modal */}
      {approvalResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="text-green-600" size={24} />
              </div>
              <h2 className="text-xl font-bold">승인 완료</h2>
              <p className="text-primary-500 mt-1">
                {approvalResult.shopName}의 전단지가 생성되었습니다
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-primary-500 mb-1 block">
                  매니저 편집 링크 (카톡으로 전달)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={approvalResult.editUrl}
                    className="input text-sm flex-1"
                  />
                  <button
                    onClick={() => copyToClipboard(approvalResult.editUrl, '편집 링크')}
                    className="btn btn-outline px-3"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-primary-500 mb-1 block">
                  고객 전단지 링크
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={approvalResult.publicUrl}
                    className="input text-sm flex-1"
                  />
                  <button
                    onClick={() => copyToClipboard(approvalResult.publicUrl, '전단지 링크')}
                    className="btn btn-outline px-3"
                  >
                    <Copy size={18} />
                  </button>
                  <a
                    href={approvalResult.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline px-3"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>

              <div className="bg-primary-50 rounded-lg p-3">
                <p className="text-sm text-primary-600">
                  💡 <strong>카톡 전달용 문구:</strong>
                </p>
                <p className="text-sm text-primary-500 mt-1">
                  안녕하세요! 전단지 편집 페이지가 준비되었습니다.
                  아래 링크를 눌러 상품 정보를 입력해주세요:
                  {'\n'}{approvalResult.editUrl}
                </p>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `안녕하세요! 전단지 편집 페이지가 준비되었습니다.\n아래 링크를 눌러 상품 정보를 입력해주세요:\n${approvalResult.editUrl}`,
                      '전달 문구'
                    )
                  }
                  className="btn btn-outline text-sm mt-2 w-full"
                >
                  <Copy size={16} />
                  문구 복사
                </button>
              </div>
            </div>

            <button
              onClick={() => setApprovalResult(null)}
              className="btn btn-primary w-full"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

