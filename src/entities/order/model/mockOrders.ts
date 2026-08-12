import { T_Orders } from "./types";

export const mockOrders: T_Orders[] = [
    {
        id: 1,
        price: 100,
        status: "new",
        createdAt: "20.10.2025",
        updatedAt: "20.10.2025",
    },
    {
        id: 2,
        price: 150,
        status: "cancelled",
        createdAt: "25.10.2025",
        updatedAt: "27.10.2025",
    },
    {
        id: 3,
        price: 500,
        status: "completed",
        createdAt: "23.10.2025",
        updatedAt: "25.10.2025",
    },

        {
        id: 4,
        price: 250,
        status: "processing",
        createdAt: "25.07.2026",
        updatedAt: "-",
    },

];



//  {
//         id: 1,
//         price: 100,
//         status: "active",
//         contact: {
//             email: "",
//             phone: "",
//             name: "Anna Smith",
//             deliveryAddress: "123 Main St, Anytown, USA"
//         },
//         createdAt: "",
//         updatedAt: "",
//         products: []
//     },
//     {
//         id: 2,
//         price: 150,
//         status: "active",
//         contact: {
//             email: "",
//             phone: "",
//             name: "Anna Smith",
//             deliveryAddress: "123 Main St, Anytown, USA"
//         },
//         createdAt: "",
//         updatedAt: "",
//         products: []
//     },
//     {
//         id: 3,
//         price: 500,
//         status: "active",
//         contact: {
//             email: "",
//             phone: "",
//             name: "Anna Smith",
//             deliveryAddress: "123 Main St, Anytown, USA"
//         },
//         createdAt: "",
//         updatedAt: "",
//         products: []
//     },