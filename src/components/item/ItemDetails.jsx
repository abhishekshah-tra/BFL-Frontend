import { memo } from 'react'
import { Card, TextLink } from '../common/StatusBadge'
import { Drawer } from '../common/Overlay'
import { formatEventDateTime } from '../../utils/format'

const SUMMARY_FIELDS = [
  { key: 'poNumber', label: 'PO Number' },
  { key: 'shipmentAsn', label: 'Shipment/ASN' },
  { key: 'containerNo', label: 'Container No.' },
  { key: 'palletNo', label: 'Pallet No.' },
  { key: 'cartonNo', label: 'Carton No.' },
  { key: 'sku', label: 'SKU' },
  { key: 'itemDescription', label: 'Item Description' },
  { key: 'quantity', label: 'Quantity' },
  { key: 'division', label: 'Division' },
  { key: 'destination', label: 'Destination' },
  { key: 'journeyType', label: 'Journey Type' },
]

function displayValue(item, key) {
  if (key === 'quantity') return `${item.quantity} ${item.quantityUom}`
  return String(item[key])
}

export const ItemDetails = memo(function ItemDetails({ item, onViewAll }) {
  return (
    <Card
      className="details-card"
      title="Item Details"
      footer={<TextLink onClick={onViewAll}>View All Item Details →</TextLink>}
    >
      <dl className="kv-list">
        {SUMMARY_FIELDS.map((field) => (
          <div className="kv-row" key={field.key}>
            <dt>{field.label}</dt>
            <dd>{displayValue(item, field.key)}</dd>
          </div>
        ))}
      </dl>
    </Card>
  )
})

export function ItemDetailsDrawer({ open, item, onClose }) {
  if (!item) return null
  const extra = [
    { label: 'PO Number', value: item.poNumber },
    { label: 'Shipment/ASN', value: item.shipmentAsn },
    { label: 'Container No.', value: item.containerNo },
    { label: 'Pallet No.', value: item.palletNo },
    { label: 'Carton No.', value: item.cartonNo },
    { label: 'SKU', value: item.sku },
    { label: 'Item Description', value: item.itemDescription },
    { label: 'Quantity', value: `${item.quantity} ${item.quantityUom}` },
    { label: 'Division', value: item.division },
    { label: 'Brand', value: item.brand },
    { label: 'Color', value: item.color },
    { label: 'Size', value: item.size },
    { label: 'Net Weight', value: item.netWeight },
    { label: 'Supplier', value: item.supplierName },
    { label: 'Origin Country', value: item.originCountry },
    { label: 'HS Code', value: item.hsCode },
    { label: 'Destination', value: item.destination },
    { label: 'Journey Type', value: item.journeyType },
    { label: 'Expected Store Date', value: item.expectedStoreDate },
  ]

  return (
    <Drawer open={open} title="All Item Details" onClose={onClose}>
      <dl className="kv-list kv-list--drawer">
        {extra.map((row) => (
          <div className="kv-row" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </Drawer>
  )
}

export function EventLogDrawer({ open, events, milestones, onClose }) {
  return (
    <Drawer open={open} title="Full Event Log" onClose={onClose} width={480}>
      <ol className="event-log">
        {events.map((event) => {
          const milestone = milestones.find((item) => item.id === event.milestoneId)
          return (
            <li key={event.id}>
              <p className="event-log__title">{event.event}</p>
              <p className="event-log__meta">
                {milestone?.name ?? 'Event'} · {event.user} · {formatEventDateTime(event.time)}
              </p>
            </li>
          )
        })}
      </ol>
    </Drawer>
  )
}
