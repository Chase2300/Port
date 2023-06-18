import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    tasks: JSON.parse(localStorage.getItem("tasks")) || [],
  },
  mutations: {
    addTask(state, task) {
      state.tasks.push(task);
    },
    updateTask(state, { index, task }) {
      Vue.set(state.tasks, index, task);
    },
    deleteTask(state, index) {
      state.tasks.splice(index, 1);
    },
  },
  actions: {
    createTask({ commit, state }, task) {
      commit("addTask", task);
      localStorage.setItem("tasks", JSON.stringify(state.tasks));
    },
    updateTask({ commit, state }, { index, task }) {
      const existingTask = state.tasks[index];
      if (existingTask) {
        const updatedTask = { ...existingTask, ...task };
        commit("updateTask", { index, task: updatedTask });
        localStorage.setItem("tasks", JSON.stringify(state.tasks));
      }
    },
    deleteTask({ commit, state }, index) {
      const existingTask = state.tasks[index];
      if (existingTask) {
        commit("deleteTask", index);
        localStorage.setItem("tasks", JSON.stringify(state.tasks));
      }
    },
  },
  getters: {
    getTaskById: (state) => (id) => {
      return state.tasks.find((task) => task.id === id);
    },
  },
});