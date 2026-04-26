import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';
import { Star, Loader2 } from 'lucide-react';
import { getAllReviews, ReviewDto } from '../api';

export function Reviews() {
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const data = await getAllReviews();
        setReviews(data);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Reviews</h1>
      </div>

      <Card>
        <Table>
          <TableHead>
            <tr>
              <TableCell isHeader>Product ID</TableCell>
              <TableCell isHeader>Customer ID</TableCell>
              <TableCell isHeader>Rating</TableCell>
              <TableCell isHeader>Comment</TableCell>
              <TableCell isHeader>Date</TableCell>
            </tr>
          </TableHead>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.reviewID}>
                <TableCell className="font-medium text-gray-900">Product #{review.productID}</TableCell>
                <TableCell className="text-gray-600">User #{review.userID}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-gray-600 max-w-xs truncate" title={review.body}>{review.body}</TableCell>
                <TableCell className="text-gray-500 text-sm">{new Date(review.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
