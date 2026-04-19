import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { STATUSES } from '@shared/constants.js';
import ContactCard from './ContactCard.jsx';
import styles from './KanbanView.module.css';

export default function KanbanView({
  contacts,
  onCardOpen,
  onStatusChange,
  onEdit,
  onDelete,
  laatsteActiviteitIndex,
}) {
  const byStatus = STATUSES.reduce((acc, s) => {
    acc[s] = [];
    return acc;
  }, {});

  for (const c of contacts) {
    const status = STATUSES.includes(c.status) ? c.status : 'Nieuw';
    byStatus[status].push(c);
  }

  function onDragEnd(result) {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;
    const moved = contacts.find((c) => c.id === draggableId);
    if (!moved) return;
    onStatusChange(moved, destination.droppableId);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.board}>
        {STATUSES.map((status) => (
          <Droppable droppableId={status} key={status}>
            {(provided, snapshot) => (
              <div
                className={`${styles.column} ${snapshot.isDraggingOver ? styles.columnActive : ''}`}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                <div className={styles.columnHeader}>
                  <span className={styles.columnTitle}>{status}</span>
                  <span className={styles.columnCount}>{byStatus[status].length}</span>
                </div>
                <div className={styles.cards}>
                  {byStatus[status].map((contact, index) => (
                    <Draggable draggableId={contact.id} index={index} key={contact.id}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={`${styles.cardWrap} ${dragSnapshot.isDragging ? styles.dragging : ''}`}
                          style={dragProvided.draggableProps.style}
                        >
                          <ContactCard
                            contact={contact}
                            onOpen={onCardOpen}
                            onStatusChange={onStatusChange}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            dragHandleProps={dragProvided.dragHandleProps}
                            laatsteActiviteit={laatsteActiviteitIndex ? laatsteActiviteitIndex.get(contact.id) : null}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {byStatus[status].length === 0 && (
                    <div className={styles.empty}>Geen contacten</div>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}
