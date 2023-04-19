export type Tuser = {
    id: string,
    name: string,
    email: string,
    password: string,
    created_at: string
}

export type Tproduct = {
    id: string,
    name: string,
    price: number,
    discription: string,
    image_url: string
}

export type Tpurchase {
    id: string,
    buyer: string, 
    total_price: number,
    created_at: number,
    paid: number
}

export type Tpruchases_products = {
    purchase_id: string,
    product_id: string,
    quantity: number
}
