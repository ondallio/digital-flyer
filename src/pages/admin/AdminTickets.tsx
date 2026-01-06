import { useEffect, useState } from 'react';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { ticketRepository, ticketMessageRepository, vendorRepository } from '../../lib/storage';
import type { Ticket, TicketMessage, Vendor } from '../../types';

type TabType = 'all' | Ticket['status'];

export default function AdminTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('open');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [vendors, setVendors] = useState<Record<string, Vendor>>({});

  useEffect(() => {
    loadTickets();
    loadVendors();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [tickets, activeTab]);

  useEffect(() => {
    if (selectedTicket) {
      loadMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const loadTickets = () => {
    const data = ticketRepository.getAll();
    setTickets(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const loadVendors = () => {
    const data = vendorRepository.getAll();
    const map: Record<string, Vendor> = {};
    data.forEach((v) => {
      map[v.id] = v;
    });
    setVendors(map);
  };

  const loadMessages = (ticketId: string) => {
    const data = ticketMessageRepository.getByTicketId(ticketId);
    setMessages(data);
  };

  const filterTickets = () => {
    let filtered = [...tickets];
    if (activeTab !== 'all') {
      filtered = filtered.filter((t) => t.status === activeTab);
    }
    setFilteredTickets(filtered);
  };

  const handleSendMessage = () => {
    if (!selectedTicket || !newMessage.trim()) return;

    ticketMessageRepository.create({
      ticketId: selectedTicket.id,
      author: 'admin',
      message: newMessage.trim(),
    });

    // Update ticket status if it was open
    if (selectedTicket.status === 'open') {
      ticketRepository.update(selectedTicket.id, { status: 'in_progress' });
    }

    setNewMessage('');
    loadMessages(selectedTicket.id);
    loadTickets();
  };

  const handleCloseTicket = () => {
    if (!selectedTicket) return;
    if (confirm('이 문의를 완료 처리하시겠습니까?')) {
      ticketRepository.update(selectedTicket.id, { status: 'closed' });
      loadTickets();
      setSelectedTicket(null);
    }
  };

  const getStatusBadge = (status: Ticket['status']) => {
    const styles = {
      open: 'bg-red-100 text-red-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      closed: 'bg-green-100 text-green-700',
    };
    const labels = {
      open: '미응답',
      in_progress: '처리중',
      closed: '완료',
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'open', label: '미응답', count: tickets.filter((t) => t.status === 'open').length },
    { key: 'in_progress', label: '처리중', count: tickets.filter((t) => t.status === 'in_progress').length },
    { key: 'closed', label: '완료', count: tickets.filter((t) => t.status === 'closed').length },
    { key: 'all', label: '전체', count: tickets.length },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">문의 관리</h1>
        <p className="text-primary-500 mt-1">거래처 문의를 확인하고 답변하세요</p>
      </div>

      {/* Tabs */}
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

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Ticket List */}
        <div className="card divide-y divide-primary-100 max-h-[600px] overflow-y-auto">
          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-primary-400">
              <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
              <p>문의 내역이 없습니다</p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full p-4 text-left hover:bg-primary-50 transition-colors ${
                  selectedTicket?.id === ticket.id ? 'bg-primary-50' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">
                        {vendors[ticket.vendorId]?.shopName || '알 수 없음'}
                      </span>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-sm text-primary-600 truncate">{ticket.subject}</p>
                    <p className="text-xs text-primary-400 mt-1">
                      {new Date(ticket.createdAt).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Message Thread */}
        <div className="card flex flex-col h-[600px]">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-primary-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {vendors[selectedTicket.vendorId]?.shopName || '알 수 없음'}
                    </h3>
                    <p className="text-sm text-primary-500">{selectedTicket.subject}</p>
                  </div>
                  {selectedTicket.status !== 'closed' && (
                    <button
                      onClick={handleCloseTicket}
                      className="btn btn-outline text-sm"
                    >
                      <CheckCircle size={16} />
                      완료
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.author === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        msg.author === 'admin'
                          ? 'bg-primary-900 text-white'
                          : 'bg-primary-100 text-primary-900'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.author === 'admin' ? 'text-primary-300' : 'text-primary-400'
                        }`}
                      >
                        {new Date(msg.createdAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTicket.status !== 'closed' && (
                <div className="p-4 border-t border-primary-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="답변을 입력하세요..."
                      className="input flex-1"
                    />
                    <button onClick={handleSendMessage} className="btn btn-primary">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-primary-400">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
                <p>문의를 선택하세요</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

