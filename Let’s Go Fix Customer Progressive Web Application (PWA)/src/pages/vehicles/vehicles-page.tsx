import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Car, Plus, Star, Trash2 } from 'lucide-react'
import { TopBar } from '@/components/layout/top-bar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import {
  useVehicles,
  useVehicleTypes,
  useAddVehicle,
  useSetPrimaryVehicle,
  useDeleteVehicle,
} from '@/hooks/use-vehicles'

const vehicleSchema = z.object({
  vehicleTypeId: z.string().min(1, 'Select a vehicle type'),
  make: z.string().min(1, 'Enter the make'),
  model: z.string().min(1, 'Enter the model'),
  year: z.string().optional(),
  plateNumber: z.string().min(1, 'Enter the plate number'),
  color: z.string().optional(),
})

type VehicleForm = z.infer<typeof vehicleSchema>

export default function VehiclesPage() {
  const [open, setOpen] = useState(false)
  const { data: vehicles, isLoading } = useVehicles()
  const { data: vehicleTypes } = useVehicleTypes()
  const addVehicle = useAddVehicle()
  const setPrimary = useSetPrimaryVehicle()
  const deleteVehicle = useDeleteVehicle()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<VehicleForm>({ resolver: zodResolver(vehicleSchema) })

  const onSubmit = (values: VehicleForm) => {
    addVehicle.mutate(
      {
        vehicleTypeId: values.vehicleTypeId,
        make: values.make,
        model: values.model,
        year: values.year ? Number(values.year) : undefined,
        plateNumber: values.plateNumber,
        color: values.color,
      },
      {
        onSuccess: () => {
          reset()
          setOpen(false)
        },
      },
    )
  }

  return (
    <div>
      <TopBar title="My Vehicles" subtitle="Manage the vehicles you request help for" />

      <div className="flex flex-col gap-3 p-4">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="brand" size="lg" className="w-full">
              <Plus className="h-4 w-4" /> Add vehicle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Add a vehicle</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Vehicle type</Label>
                <Controller
                  name="vehicleTypeId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleTypes?.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.vehicleTypeId && (
                  <p className="text-xs text-red-600">{errors.vehicleTypeId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" placeholder="Toyota" {...register('make')} />
                  {errors.make && <p className="text-xs text-red-600">{errors.make.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" placeholder="Aqua" {...register('model')} />
                  {errors.model && <p className="text-xs text-red-600">{errors.model.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" type="number" placeholder="2020" {...register('year')} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" placeholder="White" {...register('color')} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="plateNumber">Plate number</Label>
                <Input id="plateNumber" placeholder="ABC-1234" {...register('plateNumber')} />
                {errors.plateNumber && (
                  <p className="text-xs text-red-600">{errors.plateNumber.message}</p>
                )}
              </div>

              <Button type="submit" variant="brand" disabled={addVehicle.isPending} className="mt-2">
                {addVehicle.isPending ? 'Adding…' : 'Add vehicle'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading && <p className="text-center text-sm text-slate-400">Loading…</p>}

        {!isLoading && vehicles?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
              <Car className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">No vehicles yet. Add one to request assistance.</p>
            </CardContent>
          </Card>
        )}

        {vehicles?.map((v) => (
          <Card key={v.id}>
            <CardContent className="flex items-center justify-between gap-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900">
                      {v.make} {v.model} {v.year ? `(${v.year})` : ''}
                    </p>
                    {v.is_primary && <Badge variant="brand">Primary</Badge>}
                  </div>
                  <p className="text-sm text-slate-500">{v.plate_number}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {!v.is_primary && (
                  <Button variant="ghost" size="icon" onClick={() => setPrimary.mutate(v.id)} title="Set as primary">
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteVehicle.mutate(v.id)}
                  title="Remove vehicle"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
