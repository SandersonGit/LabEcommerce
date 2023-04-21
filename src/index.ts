import express, { Request, Response } from "express";
import cors from "cors";
import { db } from "./database/knex";
import { Tuser, Tproduct, Tpurchase, Tpruchases_products } from "./types";
import { error } from "console";

const app = express();

app.use(cors());
app.use(express.json());

app.listen(3000, () => {
  console.log(`Servidor rodando na porta ${3000}`);
});

app.get("/ping", async (req: Request, res: Response) => {
  try {
    res.status(200).send({ message: "Pong!" });
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

app.get("/users", async (req: Request, res: Response) => {
  try {
    const users = await db("users");
    res.status(200).send(users);
  } catch (Erro) {
    res.status(500).send("error");
  }
});
app.post("/users", async (req: Request, res: Response) => {
  const { id, name, email, password } = req.body;

  try {
    const idExist = await db("users").where("id", id).first();
    const emailExist = await db("users").where("email", email).first();

    if (idExist || emailExist) {
      return res.status(404).send({
        menssage:
          "O Id ou email já estão cadastrados no banco de dados, favor enserir os dados novamente!",
      });
    }

    await db("users").insert({
      id,
      name,
      email,
      password,
    });

    res.status(201).send("Usuário cadatrado com sucesso!");
  } catch (Erro) {
    res.status(500).send("error");
  }
});

//   app.get('/products', async (req: Request, res: Response) => {
//     try {
//       const product = await db('products')
//       res.status(200).send(product)
//     } catch (Erro) {
//       res.status(500).send("error");
//     }
//   });

app.get("/products", async (req: Request, res: Response) => {
  const { name } = req.query;

  try {
    let products;

    if (name) {
      products = await db("products").where("name", "like", `%${name}%`);
    } else {
      products = await db("products").select();
    }

    if (!products.length) {
      return res.status(404).send({ message: "produto não encontrado!" });
    }

    return res.status(200).send(products);
  } catch (err) {
    return res.status(500).json({ message: error });
  }
});

app.post("/products", async (req: Request, res: Response) => {
  const { id, name, price, description, image_url } = req.body;

  if (!id || !name || !price || !description || !image_url) {
    return res
      .status(404)
      .send({
        message:
          "ID, Name, price, description e image_url denvem constar na requisição!",
      });
  }

  try {
    const newProduct = {
      id,
      name,
      price,
      description,
      image_url,
    };

    const productId = await db("products").insert(newProduct);

    const createdProduct = await db("products")
      .where({ id: productId })
      .first();

    return res.status(201).send({
      message: "produto cadastrado com sucesso!",
      createdProduct,
    });
  } catch (err) {
    return res.status(500).json({ message: error });
  }
});

app.put("/products/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, description, image_url } = req.body;

  if (!name && !price && !description && !image_url) {
    return res
      .status(404)
      .send({
        message:
          "Os campos (name, price, description ou image_url) é requerido para continuar a requisiçao!",
      });
  }

  try {
    const existingProduct = await db("products").where({ id }).first();

    if (!existingProduct) {
      return res
        .status(404)
        .send({ message: `Produto com o ID ${id} não encontrado` });
    }

    const updatedProduct = {
      ...existingProduct,
      name: name || existingProduct.name,
      price: price || existingProduct.price,
      description: description || existingProduct.description,
      image_url: image_url || existingProduct.image_url,
    };

    await db("products").where({ id }).update(updatedProduct);

    return res
      .status(200)
      .send({
        existingProduct,
        updatedProduct,
        message: "Produto atualizado com sucesso!",
      });
  } catch (error) {
    return res.status(500).send({ message: error });
  }
});


app.get("/purchases/:id", async (req: Request, res: Response) => {
    try {
      
      const purchaseId = req.params.id as string;
  
      
      if (!purchaseId) {
        res.status(404);
        throw new Error("Compra não localizada não encontrado");
      }
  
     
      const resultFinal = await db("purchases")
    .select(
      "purchases.id ",
      "buyer",
      "users.name AS buyerName",
      "users.email AS buyerEmail",
      "total_price AS totalPrice",
      "created_at AS createdAt",
      "paid",
      "quantity",
      "products.id",
      "products.name",
      "price",
      "description",
      "imageUrl"
    )
    .innerJoin(
      "users",
      "purchases.buyer",
      "=",
      "users.id"
    )
    .innerJoin(

      "purchases_products",
      "purchases.id",
      "=",
      "purchases_products.purchases_id"
    )
    .innerJoin(
      "products",
      "products.id",
      "=",
      "purchases_products.products_id"
    )
    .where("purchases.id", "=", `${purchaseId}`)
    

      
      
  
      res.status(200).send(resultFinal);
  
    } catch (err) {
      console.log(err);
      if (res.statusCode === 200) {
        res.status(500);
      }
  
      if (err instanceof Error) {
        res.send(err.message);
      } else {
        res.send("Erro inesperado");
      }
    }
  });

  app.post("/purchases", async (req: Request, res: Response) => {
    try {
      const { id, buyer, totalPrice, products } = req.body;
  
      if (!id || !buyer || !totalPrice || !products) {
        throw new Error("Dados inválidos.");
      }
  
      await db.raw(`
        INSERT INTO purchases(id, buyer, total_price)
        VALUES("${id}","${buyer}","${totalPrice}");
      `);
  
      for (const product of products) {
        await db.raw(`
          INSERT INTO purchases_products(purchase_id, product_id, quantity)
          VALUES("${id}","${product.id}","${product.quantity}");
        `);
      }
  
      res.status(201).send({ message: "Pedido realizado com sucesso" });
    } catch (err) {
      console.log(err);
      if (res.statusCode === 200) {
        res.status(500);
      }
  
      if (err instanceof Error) {
        res.send(err.message);
      } else {
        res.send("Error inesperado");
      }
    }
  });

  app.delete("/purchases/:id", async (req: Request, res: Response)=>{
    try {
      
        const id = req.params.id

        await db("purchases_products").del().where({purchase_id: id})
        await db("purchases").del().where({id})

      res.status(200).send("Compra excluida com sucesso!")
    } catch (error) {
      if (res.statusCode === 200) {
        res.status(500);
      }
  
      if (error instanceof Error) {
        res.send(error);
      } else {
        res.send("Error inesperado");
      }
    }
  })


  
  