import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { RESELLER_STATUSES } from '@shared/constants.js';
import ResellerCard from './ResellerCard.jsx';
import styles from './KanbanView.module.css';

export default function ResellerKanban({
  resellers,
  onCardOpen,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  const byStatus = RESELLER_STATUSES.reduce((acc, s) => {
    acc[s] = [];
    return acc;
  }, {});

  for (const r of resellers) {
    const status = RESELLER_STATUSES.includes(r.status) ? r.status : 'Nieuw';
    byStatus[status].push(r);
  }

  function onDragEnd(result) {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;
    const moved = resellers.find((r) => r.id === draggableId);
    if (!moved) return;
    onStatusChange(moved, destination.droppableId);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className={styles.board}>
        {RESELLER_STATUSES.map((status) => (
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
                  {byStatus[status].map((reseller, index) => (
                    <Draggable draggableId={reseller.id} index={index} key={reseller.id}>
                      {(dragProvided, dragSnapshot) => (
                        <div
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          className={`${styles.cardWrap} ${dragSnapshot.isDragging ? styles.dragging : ''}`}
                          style={dragProvided.draggableProps.style}
                        >
                          <ResellerCard
                            reseller={reseller}
                            onOpen={onCardOpen}
                            onStatusChange={onStatusChange}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            dragHandleProps={dragProvided.dragHandleProps}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {byStatus[status].length === 0 && (
                    <div className={styles.empty}>Geen resellers</div>
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
