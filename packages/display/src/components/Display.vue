<template>
  <div class="tce-matching-question">
    <div
      v-for="premise in element.data.premises"
      :key="premise.key"
      class="text-title-small mt-4"
    >
      <div class="mb-4">
        <span class="font-weight-bold">
          {{ element.data.headings.premise }}:
        </span>
        {{ premise.value }}
      </div>
      <VSelect
        :items="element.data.responses"
        :label="element.data.headings.response"
        :model-value="answer[premise.key]"
        :readonly="isSubmitted"
        :rules="[requiredRule]"
        hide-details="auto"
        item-title="value"
        item-value="key"
        variant="outlined"
        @update:model-value="answer[premise.key] = $event"
      >
        <template v-if="isSubmitted" #append-inner>
          <VIcon v-bind="iconProps(premise.key)" />
        </template>
      </VSelect>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { cloneDeep } from 'lodash-es';
import type { Element } from '@tailor-cms/ce-matching-question-manifest';

const initializeAnswer = () => cloneDeep(props.userState?.response) ?? {};

const props = defineProps<{ element: Element; userState: any }>();
const emit = defineEmits<{
  'user-input': [data: { response: Record<string, string> }];
}>();

const isSubmitted = ref(!!props.userState?.isSubmitted);
const answer = ref<Record<string, string>>(initializeAnswer());

const requiredRule = (val: string | boolean | number) => {
  return !!val || 'You have to select an answer.';
};

watch(answer, (val) => emit('user-input', { response: val }), { deep: true });

const iconProps = (uuid: string) => {
  const { response, correct } = props.userState ?? {};
  const isCorrect = response?.[uuid] === correct?.[uuid];
  if (isCorrect) return { icon: 'mdi-check-circle', color: 'success' };
  return { icon: 'mdi-close-circle', color: 'error' };
};

watch(
  () => props.userState,
  (state = {}) => {
    answer.value = initializeAnswer();
    isSubmitted.value = !!state.isSubmitted;
  },
  { deep: true },
);
</script>
