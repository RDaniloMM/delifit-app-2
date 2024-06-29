"use client";

import { useRouter } from "next/navigation";
import { type Dispatch, type SetStateAction } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { formSchema, type formType } from "./SchemaCreate";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

import { ImageUpload } from "@/components/custom/ImageUpload";

import axios from "axios";
import { useQuery, useMutation } from "@tanstack/react-query";

// actions
import { updateInsumoById } from "@/actions/insumo/update-insumo";
// config and constants
import { insumoDefault } from "@/config/imageDefault";
import { TIPOS_MEDIDA } from "@/constants/prisma";
// Types
import { CategoriaInsumo, Insumo } from "@/types/db";
import { TipoMedida } from "@prisma/client";

const getInsumo = async (id: string) => {
  try {
    const response = await axios.get<Insumo>(`/api/insumo/${id}`);
    return response.data;
  } catch (error) {
    throw new Error("Error al obtener el insumo");
  }
};

const getCategoriasInsumo = async () => {
  try {
    const response = await axios.get<CategoriaInsumo[]>(
      "/api/categoria/insumo",
      {
        params: {
          activo: "true",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error("Error al leer las categorias de insumos");
  }
};

interface FormUpdateProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  cardId: string;
}

export const FormUpdate = ({ setIsOpen, cardId }: FormUpdateProps) => {
  const router = useRouter();

  const { data: categoria, isLoading: isCatLoading } = useQuery({
    queryKey: ["categorias_insumos"],
    queryFn: getCategoriasInsumo,
  });

  const { data: insumo } = useQuery({
    queryKey: ["obtener insumo"],
    queryFn: () => getInsumo(cardId),
  });

  const { mutate: actualizarInsumo } = useMutation({
    mutationFn: updateInsumoById,
    onSuccess: () => {
      toast({
        title: "Insumo Actualizado",
        description: "El insumo ha sido actualizado exitosamente",
        variant: "default",
      });
    },
  });

  const form = useForm<formType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: insumo?.nombre,
      cantidad: insumo?.cantidad,
      medida: insumo?.medida,
      id_cat_insumo: insumo?.id_cat_insumo,
      img_url: insumo?.img_url,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = (values: formType) => {
    try {
      actualizarInsumo({
        nombre: values.nombre,
        cantidad: values.cantidad,
        medidad: values.medida as TipoMedida,
        id_cat_insumo: values.id_cat_insumo,
        img_url: values.img_url,
        id_insumo: cardId,
      });
      router.refresh();
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrio un error al actualizar el insumo",
        variant: "destructive",
      });
    }
  };

  const onCancel = () => {
    // form.reset();
    router.refresh();
    setIsOpen(false);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-6'
      >
        <div className='space-y-4'>
          <FormField
            control={form.control}
            name='nombre'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombres</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLoading}
                    placeholder='Nuevo insumo'
                    type='text'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='cantidad'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLoading}
                    type='number'
                    placeholder='0'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='medida'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de medida</FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder='Selecciona una medida'
                        defaultValue={field.value}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIPOS_MEDIDA.map((med) => (
                      <SelectItem
                        key={med}
                        value={med}
                      >
                        {med}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='id_cat_insumo'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select
                  disabled={isLoading || isCatLoading}
                  onValueChange={field.onChange}
                  value={String(field.value)}
                  defaultValue={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder='Selecciona una Categoria'
                        defaultValue={field.value}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categoria?.map((cat) => (
                      <SelectItem
                        key={cat.id_cat_insumo}
                        value={cat.id_cat_insumo}
                      >
                        {cat.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='img_url'
            render={({ field: { value, onChange, ...fieldProps } }) => (
              <FormItem>
                <FormLabel>Imagen</FormLabel>
                <FormControl>
                  <ImageUpload
                    preview={insumo?.img_url}
                    onSuccess={(url) => {
                      form.setValue("img_url", url);
                      toast({
                        title: "Imagen subida",
                        description: "La imagen ha sido subida exitosamente",
                        variant: "default",
                      });
                    }}
                    onError={(error) => {
                      form.setValue("img_url", insumoDefault);
                      toast({
                        title: "Error",
                        description: error,
                        variant: "destructive",
                      });
                    }}
                    className='size-40 bg-inherit hover:bg-secondary outline-dashed border-primary rounded-lg'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className=' flex items-center justify-end gap-x-2'>
          <Button
            type='submit'
            disabled={isLoading}
            variant='default'
          >
            Actualizar
          </Button>
          <Button
            type='button'
            disabled={isLoading}
            variant='secondary'
            onClick={() => onCancel()}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </Form>
  );
};
