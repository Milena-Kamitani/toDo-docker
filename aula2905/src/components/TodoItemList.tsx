import React from 'react'
import { FlatList, View } from 'react-native'
import TodoItemType from '../types/TodoItem'
import TodoItem from './TodoItem'
import { useAsyncStorage } from '../hooks/useAsyncStorage'
import { storageTodoListKey } from '../utils/constants'

type TodoItemProps = {
  onDelete: (item: TodoItemType) => void
  onEdit: (item: TodoItemType) => void
  itemsList: TodoItemType[]
}

const TodoItemList = ({ onDelete, onEdit, itemsList }: TodoItemProps) => {
  const [lsTodoItem] = useAsyncStorage<TodoItemType[]>(storageTodoListKey, [])

  return (
    <FlatList
      style={{ width: '100%' }}
      data={itemsList}
      renderItem={({ item }) => (
        <TodoItem todoItem={item} onDelete={onDelete} onEdit={onEdit} />
      )}
      keyExtractor={(item) => JSON.stringify(item)} // Cria key para cada item da lista
      contentContainerStyle={{ gap: 5, marginTop: 5 }}
      ListFooterComponent={<View style={{ height: 20 }} />}
    />
  )
}

export default React.memo(TodoItemList)
