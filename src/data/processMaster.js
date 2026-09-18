export const PROCESS_MASTER_DATA = [
  {
    _id: '1',
    code: 'RECEIVING',
    name: 'Receiving',
    description: 'Parcels enter warehouse',
    sequence: 1,
    capacityPerHour: 3200,
    sla: 30,
    slaUnit: 'Minutes',
    isActive: true,
  },
  {
    _id: '2',
    code: 'CHECKING',
    name: 'Checking',
    description: 'Quality and document verification',
    sequence: 2,
    capacityPerHour: 2900,
    sla: 30,
    slaUnit: 'Minutes',
    isActive: true,
  },
  {
    _id: '3',
    code: 'TAGGING',
    name: 'Tagging',
    description: 'Label and barcode tagging',
    sequence: 3,
    capacityPerHour: 2700,
    sla: 30,
    slaUnit: 'Minutes',
    isActive: true,
  },
  {
    _id: '4',
    code: 'ALLOCATION',
    name: 'Allocation',
    description: 'Assign destination and route',
    sequence: 4,
    capacityPerHour: 3000,
    sla: 15,
    slaUnit: 'Minutes',
    isActive: true,
  },
  {
    _id: '5',
    code: 'SORTING',
    name: 'Sorting',
    description: 'Sort parcels by destination',
    sequence: 5,
    capacityPerHour: 2400,
    sla: 45,
    slaUnit: 'Minutes',
    isActive: true,
  },
  {
    _id: '6',
    code: 'STAGING',
    name: 'Staging',
    description: 'Prepare parcels for dispatch',
    sequence: 6,
    capacityPerHour: 2700,
    sla: 60,
    slaUnit: 'Minutes',
    isActive: true,
  },
  {
    _id: '7',
    code: 'DISPATCH',
    name: 'Dispatch',
    description: 'Final outbound shipment',
    sequence: 7,
    capacityPerHour: 2800,
    sla: 60,
    slaUnit: 'Minutes',
    isActive: true,
  },
];

export const formatProcessSla = (sla, unit) => {
  if (sla == null || sla === '') return '-';

  const suffix =
    unit === 'Hours' ? 'h' : unit === 'Days' ? 'd' : 'm';

  return `${sla}${suffix}`;
};
