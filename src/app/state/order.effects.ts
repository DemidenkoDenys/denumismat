import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as OrderActions from './order.actions';
import { FirestoreService } from '../services/firestore.service';
import { Order } from '../models/order.model';

@Injectable()
export class OrderEffects {
  private actions$ = inject(Actions);
  private firestoreService = inject(FirestoreService);

  submitOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.submitOrder),
      switchMap(({ order }) => {
        const orderData: Omit<Order, 'id'> = {
          ...order,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        return this.firestoreService.addDocument('orders', orderData).pipe(
          map((docRef) => {
            const newOrder: Order = {
              ...orderData,
              id: docRef.id
            };
            return OrderActions.submitOrderSuccess({ order: newOrder });
          }),
          catchError((error) => {
            console.error('Error submitting order:', error);
            return of(OrderActions.submitOrderFailure({ error }));
          })
        );
      })
    )
  );

  loadOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.loadOrders),
      switchMap(() =>
        this.firestoreService.listenToCollection('orders').pipe(
          map((orders: Order[]) => OrderActions.loadOrdersSuccess({ orders })),
          catchError((error) => {
            console.error('Error loading orders:', error);
            return of(OrderActions.loadOrdersFailure({ error }));
          })
        )
      )
    )
  );

  updateOrderStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.updateOrderStatus),
      switchMap(({ orderId, status }) =>
        this.firestoreService.updateDocument('orders', orderId, {
          status,
          updatedAt: new Date()
        }).pipe(
          map(() => {
            // Since updateDocument doesn't return the updated document,
            // we need to fetch it or construct it
            // For simplicity, we'll emit success and let the component refetch if needed
            return OrderActions.updateOrderStatusSuccess({
              order: { id: orderId, status } as Order
            });
          }),
          catchError((error) => {
            console.error('Error updating order status:', error);
            return of(OrderActions.updateOrderStatusFailure({ error }));
          })
        )
      )
    )
  );
}
