import React from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  TouchableOpacity,
} from 'react-native'
import { AntDesign } from '@expo/vector-icons'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { ToDoStackParamList } from '../navigation/StackNavigator'
import Modal from '../components/Modal'
import TodoItemType from '../types/TodoItem'
import { useAsyncStorage } from '../hooks/useAsyncStorage'
import TodoItemList from '../components/TodoItemList'
import { storageTodoListKey } from '../utils/constants'

const initialTodoItem: TodoItemType = { description: '', title: '' }

type TodoListScreenProps = NativeStackScreenProps<
  ToDoStackParamList,
  'TodoList'
>

const TodoListScreen = ({ navigation }: TodoListScreenProps) => {
  const [modalVisible, setModalVisible] = React.useState(false)
  const [modalEditVisible, setModalEditVisible] = React.useState(false)
  const [isEdit, setIsEdit] = React.useState(false)
  const [todoItem, setTodoItem] = React.useState<TodoItemType>(initialTodoItem)
  const [itemsList, setItemsList] = React.useState<TodoItemType[]>([])


  React.useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            setIsEdit(false)
            setModalVisible(true)
          }}
          style={{ padding: 15 }}
        >
          <AntDesign name="pluscircle" size={24} color="darkseagreen" />
        </TouchableOpacity>
      ),
    })
  }, [navigation])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const response = await fetch('http://localhost:3000/tasks')
      const data = await response.json()
      console.log("data: "+JSON.stringify(data, null, 2))
      setItemsList(data)
    });
    
    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);

  const handleAddItem = async () => {
    if (!todoItem) {
      alert('Descrição da tarefa inválida!')
      return
    }

    const newItem: TodoItemType = {
      ...todoItem,
    }

    try {
      await fetch('http://localhost:3000/tasks', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      })
      setItemsList([...itemsList, newItem])
    } catch (error) {
      console.error(error)
    }

    setTodoItem(initialTodoItem)
    setModalVisible(false)
  }

  const handleDeleteItem = async(item: TodoItemType) => {
    const index = itemsList.findIndex((itemm) => itemm.id === item.id)
    console.log('index: '+index)
    const newList = [...itemsList]
    newList.splice(index,1)
    console.log('index: '+JSON.stringify(newList, null, 2))
    setItemsList(newList)

    try {
      await fetch(`http://localhost:3000/tasks/id/${item.id}`, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
          'Content-Type':'application/json'
        }
      })
    } catch (error) {
      console.log(error)
    }
  }
  
  const handleEditItem = (item: TodoItemType) => {
      setTodoItem(item)
      setModalEditVisible(true)
  }

  const handleEditItemSubmit = async () => {
    const index = itemsList.findIndex((itemm) => itemm.id === todoItem.id)
    console.log('index: '+index)
    const newList = [...itemsList]
    newList[index] = todoItem
    console.log('index: '+JSON.stringify(newList, null, 2))
    setItemsList(newList)
    setModalEditVisible(false)


    try {
      await fetch(`http://localhost:3000/tasks/id/${todoItem.id}`, {
        method: 'PATCH',
        mode: 'cors',
        headers: {
          'Content-Type':'application/json'
        },
        body: JSON.stringify(todoItem)
      })
    } catch (error) {
      console.log(error)
    }

    setTodoItem(initialTodoItem)
  }

  return (
    <View style={styles.container}>
      {/* Modal do nosso projeto */}
      <Modal
        modalVisible={modalVisible}
        onCloseModal={() => {
          setModalVisible(!modalVisible)
          setTodoItem(initialTodoItem)
        }}
        title="Descreva a tarefa"
      >
        {/* Input para guardar o titulo */}
        <TextInput
          style={styles.input}
          placeholder="Título"
          value={todoItem.title}
          onChangeText={(textValue) =>
            setTodoItem((prev) => ({ ...prev, title: textValue }))
          }
        />

        {/* Input para guardar a descrição */}
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          placeholder="Descrição"
          value={todoItem.description}
          onChangeText={(textValue) =>
            setTodoItem((prev) => ({ ...prev, description: textValue }))
          }
          multiline={true}
          numberOfLines={4}
        />

        {/* Botões da modal */}
        <View style={{ flexDirection: 'row', gap: 5 }}>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={handleAddItem}
          >
            <Text style={styles.textStyle}>
              {isEdit ? 'Editar' : 'Adicionar'}
            </Text>
          </Pressable>
        </View>
      </Modal>

      {/* Modal EDIT do nosso projeto */}
      <Modal
        modalVisible={modalEditVisible}
        onCloseModal={() => {
          setModalEditVisible(!modalEditVisible)
          setTodoItem(initialTodoItem)
        }}
        title="Edite a tarefa"
      >
        {/* Input para guardar o titulo */}
        <TextInput
          style={styles.input}
          placeholder="Título"
          value={todoItem.title}
          onChangeText={(textValue) =>
            setTodoItem((prev) => ({ ...prev, title: textValue }))
          }
        />

        {/* Input para guardar a descrição */}
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          placeholder="Descrição"
          value={todoItem.description}
          onChangeText={(textValue) =>
            setTodoItem((prev) => ({ ...prev, description: textValue }))
          }
          multiline={true}
          numberOfLines={4}
        />

        {/* Botões da modal */}
        <View style={{ flexDirection: 'row', gap: 5 }}>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={handleEditItemSubmit}
          >
            <Text style={styles.textStyle}>
              {isEdit ? 'Editar' : 'Editar'}
            </Text>
          </Pressable>
        </View>
      </Modal>

      {/* Lista de tarefas salvas */}
      <TodoItemList
        itemsList={itemsList}
        onDelete={handleDeleteItem}
        onEdit={handleEditItem}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  input: {
    width: '100%',
    minWidth: '50%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 20,
    marginBottom: 10,
  },

  button: {
    borderRadius: 5,
    padding: 10,
    elevation: 2,
    marginLeft: 'auto',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
  },
})

export default TodoListScreen
