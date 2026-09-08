import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { formatEventDateTime } from '../../utils/format'
import { Card, TextLink } from '../common/StatusBadge'
import { Modal } from '../common/Overlay'

export function CommentsPanel({ comments, onAdd }) {
  return (
    <Card
      className="comments-card"
      title={
        <span className="card__title-row">
          Comments / Notes
          <span className="count-badge">{comments.length}</span>
        </span>
      }
      footer={
        <TextLink onClick={onAdd}>
          Add Comment <Pencil size={13} />
        </TextLink>
      }
    >
      {comments.length === 0 ? (
        <p className="muted">No comments yet.</p>
      ) : (
        <ul className="comment-list">
          {comments.map((comment) => (
            <li key={comment.id}>
              <p className="comment-list__meta">
                {formatEventDateTime(comment.timestamp)} | {comment.role} - {comment.location}
              </p>
              <p>{comment.message}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export function AddCommentModal({ open, onClose, onSave }) {
  const [message, setMessage] = useState('')
  const [role, setRole] = useState('Ops Analyst')
  const [location, setLocation] = useState('Control Tower')

  const reset = () => {
    setMessage('')
    setRole('Ops Analyst')
    setLocation('Control Tower')
  }

  const save = () => {
    if (!message.trim()) return
    onSave({
      message,
      author: 'You',
      role,
      location,
    })
    reset()
    onClose()
  }

  return (
    <Modal
      open={open}
      title="Add Comment"
      onClose={() => {
        reset()
        onClose()
      }}
      footer={
        <>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => {
              reset()
              onClose()
            }}
          >
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={save} disabled={!message.trim()}>
            Save
          </button>
        </>
      }
    >
      <div className="filter-form">
        <label>
          Role
          <input value={role} onChange={(event) => setRole(event.target.value)} />
        </label>
        <label>
          Location
          <input value={location} onChange={(event) => setLocation(event.target.value)} />
        </label>
        <label>
          Comment
          <textarea
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Add an operational note..."
          />
        </label>
      </div>
    </Modal>
  )
}
