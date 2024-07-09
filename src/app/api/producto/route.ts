import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let data;
  try {
    const activo = searchParams.get("activo");
    const id_categoria = searchParams.get("id_categoria");
    if (activo === "true" || activo === "false") {
      data = await prisma.producto.findMany({
        where: {
          activo: activo === "true",
          id_cat_producto: id_categoria ?? undefined,
        },
        select: {
          id_producto: true,
          img_url: true,
          nombre: true,
          descripcion: true,
          precio_base: true,
          id_cat_producto: true,
          activo: true,
          createdAt: true,
          updatedAt: true,
          cat_producto: {
            select: {
              nombre: true,
              id_cat_producto: true,
            },
          },
        },
      });
    } else {
      data = await prisma.producto.findMany({
        where: {
          id_cat_producto: id_categoria ?? undefined,
        },
        select: {
          id_producto: true,
          img_url: true,
          nombre: true,
          descripcion: true,
          precio_base: true,
          id_cat_producto: true,
          activo: true,
          createdAt: true,
          updatedAt: true,
          cat_producto: {
            select: {
              nombre: true,
              id_cat_producto: true,
            },
          },
        },
      });
    }
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al leer los productos:", error.message);
    }
    return new NextResponse("Error al leer los productos", { status: 500 });
  }
}
