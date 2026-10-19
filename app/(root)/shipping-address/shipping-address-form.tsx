"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shippingAddressSchema } from "@/lib/validators";
import { shippingAddressDefaultValues } from "@/lib/constants";
import { ShippingAddress } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";
import { updateUserAddress } from "@/lib/actions/user.action";
type FormValues = z.infer<typeof shippingAddressSchema>;

const fields = [
  { name: "fullName", label: "Full Name", placeholder: "Enter full name" },
  { name: "streetAddress", label: "Address", placeholder: "Enter address" },
  { name: "city", label: "City", placeholder: "Enter city" },
  { name: "postalCode", label: "Postal Code", placeholder: "Enter postal code" },
  { name: "country", label: "Country", placeholder: "Enter country" },
] as const;


export default function ShippingAddressForm({
  address,
}: {
  address: ShippingAddress | null;
}) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || shippingAddressDefaultValues,
  });
  
  const router = useRouter();
  const onSubmit = (values: FormValues) => {
  startTransition(async () => {
    const res = await updateUserAddress(values);

    if (!res.success) {
      toast.add({
        type: "error",
        title: "Error",
        description: res.message,
        priority: "high",
      });
      return;
    }

    router.push("/payment-method");
  });
};
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="h2-bold mt-4">Shipping Address</h1>
      <p className="text-sm text-muted-foreground">
        Please enter an address to ship to
      </p>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {fields.map(({ name, label, placeholder }) => (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Input id={name} placeholder={placeholder} {...register(name)} />
            {errors[name] && (
              <p className="text-sm text-destructive">{errors[name]?.message}</p>
            )}
          </div>
        ))}
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}{" "}
          Continue
        </Button>
      </form>
    </div>
  );
}