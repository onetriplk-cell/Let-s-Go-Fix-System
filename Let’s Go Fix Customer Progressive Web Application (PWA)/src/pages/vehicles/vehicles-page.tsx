import { useEffect, useMemo, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Car, Check, Plus, Star, Trash2 } from 'lucide-react'
import { TopBar } from '@/components/layout/top-bar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Autocomplete } from '@/components/ui/autocomplete'
import { CardSkeletonGrid } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { StaggerList, StaggerItem } from '@/components/common/motion'
import { cn } from '@/lib/utils'
import {
  ALL_MAKES,
  getModelsForMake,
  getTypeHintForMake,
  isValidSriLankanPlate,
} from '@/lib/vehicle-catalog'
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
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VehicleForm>({ resolver: zodResolver(vehicleSchema) })

  const selectedMake = watch('make')
  const plateValue = watch('plateNumber')
  const modelOptions = useMemo(() => getModelsForMake(selectedMake ?? ''), [selectedMake])
  const plateIsValid = !!plateValue && isValidSriLankanPlate(plateValue)

  useEffect(() => {
    if (!selectedMake || !vehicleTypes?.length) return
    const hint = getTypeHintForMake(selectedMake)
    if (!hint) return
    const match = vehicleTypes.find((t) => t.name.toLowerCase() === hint.toLowerCase())
    if (match) setValue('vehicleTypeId', match.id, { shouldValidate: true })
  }, [selectedMake, vehicleTypes, setValue])

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

      <div className="mx-auto flex max-w-md flex-col gap-3 p-4 sm:max-w-5xl sm:p-8">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="brand" size="lg" className="w-full sm:w-auto sm:self-start sm:px-8">
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
                  <p className="text-xs text-red-600 dark:text-red-400">{errors.vehicleTypeId.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label>Make</Label>
                  <Controller
                    name="make"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        value={field.value ?? ''}
                        onChange={(v) => {
                          field.onChange(v)
                          setValue('model', '')
                        }}
                        options={ALL_MAKES}
                        placeholder="Toyota"
                      />
                    )}
                  />
                  {errors.make && <p className="text-xs text-red-600 dark:text-red-400">{errors.make.message}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Model</Label>
                  <Controller
                    name="model"
                    control={control}
                    render={({ field }) => (
                      <Autocomplete
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        options={modelOptions}
                        placeholder={selectedMake ? 'Aqua' : 'Pick a make first'}
                        disabled={!selectedMake}
                        emptyText="No known models — type your own"
                      />
                    )}
                  />
                  {errors.model && <p className="text-xs text-red-600 dark:text-red-400">{errors.model.message}</p>}
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
                <div className="relative">
                  <Input
                    id="plateNumber"
                    placeholder="ABC-1234"
                    className={cn('pr-9 uppercase', plateIsValid && 'border-emerald-400 focus-visible:ring-emerald-500 dark:border-emerald-600')}
                    {...register('plateNumber')}
                  />
                  {plateIsValid && (
                    <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                  )}
                </div>
                {errors.plateNumber ? (
                  <p className="text-xs text-red-600 dark:text-red-400">{errors.plateNumber.message}</p>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500">Sri Lankan format, e.g. WP-1234 or ABC-4567</p>
                )}
              </div>

              <Button type="submit" variant="brand" disabled={addVehicle.isPending} className="mt-2">
                {addVehicle.isPending ? 'Adding…' : 'Add vehicle'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading && (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            <CardSkeletonGrid count={3} />
          </div>
        )}

        {!isLoading && vehicles?.length === 0 && (
          <Card>
            <EmptyState
              kind="vehicles"
              title="No vehicles yet"
              description="Add one to request roadside assistance."
              action={
                <Button variant="brand" size="sm" onClick={() => setOpen(true)}>
                  <Plus className="h-4 w-4" /> Add your first vehicle
                </Button>
              }
            />
          </Card>
        )}

        <StaggerList className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {vehicles?.map((v) => (
          <StaggerItem key={v.id}>
          <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/30">
            <CardContent className="flex items-center justify-between gap-3 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {v.make} {v.model} {v.year ? `(${v.year})` : ''}
                    </p>
                    {v.is_primary && <Badge variant="brand">Primary</Badge>}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{v.plate_number}</p>
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
                  <Trash2 className="h-4 w-4 text-red-500 dark:text-red-400" />
                </Button>
              </div>
            </CardContent>
          </Card>
          </StaggerItem>
        ))}
        </StaggerList>
      </div>
    </div>
  )
}
