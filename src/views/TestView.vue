<script setup lang="ts">
import { starsService } from '@/api/starsService'
import { ref } from 'vue'
import WebApp from '@twa-dev/sdk'

const invoiceLink = ref<string | null>(null)

async function getInvoiceLink() {
  try {
    const response = await starsService.getInvoiceLink()
    invoiceLink.value = response.data.invoiceLink
  } catch (error) {
    console.log(error)
  }
}

function openInvoice() {
  if (!invoiceLink.value) return

  WebApp.openInvoice(invoiceLink.value, (status) => {
    if (status === 'paid') {
      alert('You paid!')
    }
  })
}
</script>

<template>
  <div>
    <button
      type="button"
      class="py-1 px-4 bg-orange-500 rounded-sm font-bold text-white"
      @click="getInvoiceLink"
    >
      Get Invoice
    </button>

    <button
      type="button"
      class="py-1 px-4 bg-green-500 rounded-sm font-bold text-white"
      @click="openInvoice"
    >
      Open Invoice
    </button>
  </div>
</template>
