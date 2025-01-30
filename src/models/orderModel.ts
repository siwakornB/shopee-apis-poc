interface OrderListResponse {
    more: boolean;
    order_list: OrderListItem[];
    next_cursor: string;
}

interface OrderListItem {
    order_sn: string;
    order_status: string;
    booking_sn: string;
}
