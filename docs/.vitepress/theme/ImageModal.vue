<!-- ImageModal.vue -->
<script setup>
import { ref, onMounted } from 'vue'

const isOpen = ref(false)
const currentImage = ref('')
const wrapper = ref(null)

onMounted(() => {
  // Add click handler to the image inside wrapper
  const img = wrapper.value?.querySelector('img')
  if (img) {
    img.addEventListener('click', openModal)
  }
})

const openModal = (event) => {
  currentImage.value = event.target.src
  isOpen.value = true
}

const closeModal = () => {
  isOpen.value = false
  currentImage.value = ''
}
</script>

<template>
  <div>
    <!-- Wrapper with ref to access the image -->
    <div ref="wrapper" class="image-wrapper">
      <slot></slot>
    </div>

    <!-- Modal -->
    <div v-if="isOpen" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <img :src="currentImage" alt="Modal image" />
        <button class="close-button" @click="closeModal">×</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-wrapper {
  display: inline-block;
}

.image-wrapper :slotted(img) {
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90vh;
}

.modal-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
}

.close-button {
  position: absolute;
  top: -40px;
  right: -40px;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  padding: 8px;
}

.close-button:hover {
  opacity: 0.8;
}
</style>