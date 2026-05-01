import React, { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { fetchApi } from '../lib/api';
import { Pagination } from '../components/Pagination';

interface User {
  userName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  oAuthProviderName?: string | null;
  createdAt: string;
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

type SearchType = 'all' | 'username' | 'email' | 'phone';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Omit<PagedResult<User>, 'items'>>({
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  });

  const [search, setSearch] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data: PagedResult<User> = await fetchApi(`/api/users/getall-user?page=${page}&pageSize=10`);
      setUsers(data.items || []);
      setPagination({
        totalCount: data.totalCount,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handlePageChange = (newPage: number) => {
    loadUsers(newPage);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) {
      loadUsers();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      let data: any;

      switch (searchType) {
        case 'username':
          data = await fetchApi(`/api/users/get-userbyusername?userName=${search}`);
          setUsers(data ? [data] : []);
          break;
        case 'email':
          data = await fetchApi(`/api/users/get-userbyemail?email=${search}`);
          setUsers(data ? [data] : []);
          break;
        case 'phone':
          data = await fetchApi(`/api/users/get-userbyphonenumber?phoneNumber=${search}`);
          setUsers(data ? [data] : []);
          break;
        default:
          // Fallback to client-side filter if 'all' is selected but search is pressed
          await loadUsers();
          break;
      }
    } catch (err: any) {
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = searchType === 'all' 
    ? users.filter(u => 
        u.userName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-4">
          <select 
            value={searchType}
            onChange={(e) => setSearchType(e.target.value as SearchType)}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Lọc nhanh (Tên/Email)</option>
            <option value="username">Tìm theo Username</option>
            <option value="email">Tìm theo Email</option>
            <option value="phone">Tìm theo Số điện thoại</option>
          </select>
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
                type="text" 
                placeholder="Nhập thông tin tìm kiếm..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500" 
             />
          </div>
          <button 
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Tìm kiếm
          </button>
          <button 
            type="button"
            onClick={loadUsers}
            className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-sm">
          Lỗi: {error}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Tên đăng nhập</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Số điện thoại</th>
              <th className="px-6 py-4">Địa chỉ</th>
              <th className="px-6 py-4">Loại tài khoản</th>
              <th className="px-6 py-4">Ngày đăng ký</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u, index) => (
              <tr key={index} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-900">{u.userName}</td>
                <td className="px-6 py-4 text-slate-600">{u.email}</td>
                <td className="px-6 py-4 text-slate-600">{u.phoneNumber || '-'}</td>
                <td className="px-6 py-4 text-slate-600">{u.address || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    u.oAuthProviderName ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {u.oAuthProviderName || 'Hệ thống'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  Không tìm thấy người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination 
          {...pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

