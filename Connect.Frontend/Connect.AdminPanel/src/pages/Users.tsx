import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Loader2 } from 'lucide-react';
import { getAllUsers, UserDto } from '../api';

export function Users() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);
  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users Management</h1>
      </div>

      <Card>
        <Table>
          <TableHead>
            <tr>
              <TableCell isHeader>ID</TableCell>
              <TableCell isHeader>Name</TableCell>
              <TableCell isHeader>Email</TableCell>
              <TableCell isHeader>Phone</TableCell>
              <TableCell isHeader>Role</TableCell>
              <TableCell isHeader>Joined At</TableCell>
            </tr>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.userID}>
                <TableCell className="font-mono text-xs text-gray-500">#{user.userID}</TableCell>
                <TableCell className="font-medium text-gray-900">{user.userName}</TableCell>
                <TableCell className="text-gray-600">{user.email}</TableCell>
                <TableCell className="text-gray-600">{user.phoneNumber}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'Admin' ? 'warning' : 'default'}>{user.role}</Badge>
                </TableCell>
                <TableCell className="text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
